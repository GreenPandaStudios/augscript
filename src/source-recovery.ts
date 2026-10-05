import {existsSync} from 'node:fs';
import {join} from 'node:path';
import {recoverSourceJournal,SourceChangeError} from './source-transactions.ts';
import {recoverSourceChange} from './source-transaction.ts';

/** A recovery command must never report clean while another supported journal remains. */
export function recoverAnySourceChange(root:string) {
  const mechanical=existsSync(join(root,'.aug-changes','pending.json'));
  const request=existsSync(join(root,'.aug-changes','journal.json'));
  if(mechanical&&request)throw new SourceChangeError('CHANGE_RECOVERY_CONFLICT','Both journal formats are present. Preserve them and inspect the interrupted writers before recovery.');
  return mechanical?recoverSourceJournal(root):request||existsSync(join(root,'.aug-changes','writer.json'))?recoverSourceChange(root):recoverSourceJournal(root);
}
