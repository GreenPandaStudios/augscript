#include "aug_runtime.h"
#include <stdatomic.h>
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
static atomic_bool released;
static void pending(AugValue *out,const AugValue *self,AugValue *args,int count) {
 (void)self;(void)args;if(count)abort();while(!atomic_load(&released))aug_task_checkpoint();*out=aug_int(7);
}
int main(int argc,char **argv) {
 if(argc==2&&!strcmp(argv[1],"invalid-fields")) {
  AugValue value=aug_new_object("Invalid",1,NULL,NULL,0);
  free(value.as.object->fields);value.as.object->fields=NULL;
  aug_transfer_delete(aug_transfer_capture(&value,1));return 0;
 }
 unsigned char mask[]={0};AugValue values[4]={aug_null(),aug_null(),aug_null(),aug_null()};AugFrame frame;aug_frame_enter(&frame,values,4);
 values[0]=aug_list_new(NULL,0);for(int i=0;i<500;i++)aug_list_append(values[0],aug_int(i));
 if(aug_transfer_capture_bounded(values,1,1024))abort();
 AugTransfer *copy=aug_transfer_capture_bounded(values,1,65536);if(!copy||aug_transfer_bytes(copy)>65536)abort();aug_transfer_restore(copy,&values[1],1);aug_transfer_delete(copy);if(aug_list_length(values[1])!=500)abort();
 aug_scope_enter(mask);aug_task_start_worker_pointer(&values[2],pending,NULL,NULL,0,mask);
 aug_task_start_worker_pointer(&values[3],pending,NULL,NULL,0,mask);
 if(!aug_has_error||strcmp(aug_error.as.object->type_name,"ConcurrencyError")||values[3].tag!=AUG_NULL)abort();aug_take_error();
 atomic_store(&released,true);values[3]=aug_task_wait(&values[2],1);if(aug_has_error||values[3].as.integer!=7)abort();aug_scope_leave();
 aug_scope_enter(mask);aug_task_start_worker_pointer(&values[2],pending,NULL,NULL,0,mask);values[3]=aug_task_wait(&values[2],1);if(aug_has_error||values[3].as.integer!=7)abort();aug_scope_leave();
 aug_frame_leave(&frame);aug_shutdown();puts("bounded worker admission and copies passed");return 0;
}
