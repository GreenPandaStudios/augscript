#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/* Standalone C references. These use concrete values, explicit frees and
   sequential function calls for tasks; they do not implement August's runtime. */
typedef struct { int64_t id; const char *name; } Item;
typedef struct { int64_t key, value; } Entry;
static int64_t step(int64_t value) {
  int64_t product=value*48271+1;
  return product-(product/2147483647)*2147483647;
}
static int validate(int64_t value,int64_t *result) {
  if(value%16==0)return 1;
  *result=value;return 0;
}
static int64_t compute(int64_t value) { return value*3+1; }
int main(int argc,char **argv) {
  if(argc!=3)return 2;
  char *end=NULL;int64_t count=strtoll(argv[2],&end,10);
  if(!end||*end||count<=0||count>10000000)return 2;
  int64_t sum=0;
  if(!strcmp(argv[1],"float")) {
    double total=0;
    for(int64_t i=0;i<count;i++)total+=(i%8)*0.125+0.5;
    int64_t remainder=count%8;
    double expected=(count/8)*7.5+remainder*0.5+remainder*(remainder-1)*0.0625;
    printf("%s\n%lld\n",total==expected?"true":"false",(long long)count);
  } else if(!strcmp(argv[1],"calls")) {
    int64_t state=123;for(int64_t i=0;i<count;i++)state=step(state);
    printf("%lld\n",(long long)state);
  } else if(!strcmp(argv[1],"list")) {
    size_t capacity=8;int64_t *values=malloc(capacity*sizeof(*values));if(!values)return 3;
    for(int64_t i=0;i<count;i++){
      if((size_t)i==capacity){capacity*=2;int64_t *grown=realloc(values,capacity*sizeof(*values));if(!grown){free(values);return 3;}values=grown;}
      values[i]=i*3;
    }
    int64_t *snapshot=malloc((size_t)count*sizeof(*snapshot));if(!snapshot){free(values);return 3;}
    memcpy(snapshot,values,(size_t)count*sizeof(*snapshot));
    for(int64_t i=0;i<count;i++)sum+=snapshot[i];
    free(snapshot);free(values);printf("%lld\n",(long long)sum);
  } else if(!strcmp(argv[1],"strings")) {
    for(int64_t i=0;i<count;i++){
      const char *input="August,clear,local,checked",*begin=input;
      for(const char *at=input;;at++)if(*at==','||!*at){
        size_t length=(size_t)(at-begin);char *part=malloc(length+1);if(!part)return 3;
        memcpy(part,begin,length);part[length]=0;sum+=(int64_t)strlen(part);free(part);
        if(!*at)break;begin=at+1;
      }
    }
    printf("%lld\n",(long long)sum);
  } else if(!strcmp(argv[1],"map-churn")) {
    /* A dense ordered table with linear searches is intentional here: preserve
       replacement/deletion/reinsertion ordering independently of August hashing. */
    Entry *entries=malloc((size_t)count*sizeof(*entries));if(!entries)return 3;
    size_t length=(size_t)count;
    for(size_t i=0;i<length;i++)entries[i]=(Entry){(int64_t)i,(int64_t)i*3};
    for(int64_t key=0;key<count;key+=2)for(size_t i=0;i<length;i++)if(entries[i].key==key){
      memmove(entries+i,entries+i+1,(length-i-1)*sizeof(*entries));length--;break;
    }
    for(int64_t key=0;key<count;key++){
      size_t at=0;while(at<length&&entries[at].key!=key)at++;
      if(at==length){entries[length++]=(Entry){key,key*7};}else entries[at].value=key*7;
    }
    for(size_t i=0;i<length;i++)sum+=entries[i].key*(int64_t)(i+1)+entries[i].value;
    free(entries);printf("%lld\n%zu\n",(long long)sum,length);
  } else if(!strcmp(argv[1],"errors")) {
    int64_t failures=0;
    for(int64_t i=0;i<count;i++){int64_t value;if(validate(i,&value))failures++;else sum+=value;}
    printf("%lld\n%lld\n",(long long)sum,(long long)failures);
  } else if(!strcmp(argv[1],"records")) {
    Item **items=malloc((size_t)count*sizeof(*items));if(!items)return 3;
    for(int64_t i=0;i<count;i++){items[i]=malloc(sizeof(**items));if(!items[i])return 3;*items[i]=(Item){i,"August"};}
    for(int64_t i=0;i<count;i++)sum+=items[i]->id;
    for(int64_t i=0;i<count;i++)free(items[i]);free(items);
    printf("%lld\n",(long long)sum);
  } else if(!strcmp(argv[1],"tasks")) {
    for(int64_t i=0;i<count;i++)sum+=compute(i)+compute(i+1);
    printf("%lld\n",(long long)sum);
  } else return 2;
  return 0;
}
