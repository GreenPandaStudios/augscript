import {deflateRawSync} from 'node:zlib';

const crc32=bytes=>{
  let crc=0xffffffff;
  for(const byte of bytes) {
    crc^=byte;
    for(let bit=0;bit<8;bit++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);
  }
  return (crc^0xffffffff)>>>0;
};

/** A reproducible ZIP: regular files only, with no host paths or variable timestamps. */
export function projectArchive(files) {
  const blocks=[],directory=[];
  let offset=0;
  for(const [name,content] of [...files].sort(([a],[b])=>a<b?-1:a>b?1:0)) {
    if(name.startsWith('/')||name.includes('\\')||name.split('/').some(part=>part==='..'||!part)||Buffer.byteLength(name)>65535)
      throw new Error('Invalid documentation download path: '+name);
    const filename=Buffer.from(name), data=Buffer.from(content), compressed=deflateRawSync(data,{level:9}), checksum=crc32(data);
    const header=Buffer.alloc(30);
    header.writeUInt32LE(0x04034b50,0);
    header.writeUInt16LE(20,4); header.writeUInt16LE(0x800,6); header.writeUInt16LE(8,8);
    header.writeUInt16LE(33,12); // January 1, 1980: ZIP's fixed epoch.
    header.writeUInt32LE(checksum,14); header.writeUInt32LE(compressed.length,18); header.writeUInt32LE(data.length,22);
    header.writeUInt16LE(filename.length,26);
    blocks.push(header,filename,compressed);
    const entry=Buffer.alloc(46);
    entry.writeUInt32LE(0x02014b50,0);
    entry.writeUInt16LE(0x0314,4); entry.writeUInt16LE(20,6); entry.writeUInt16LE(0x800,8); entry.writeUInt16LE(8,10);
    entry.writeUInt16LE(33,14);
    entry.writeUInt32LE(checksum,16); entry.writeUInt32LE(compressed.length,20); entry.writeUInt32LE(data.length,24);
    entry.writeUInt16LE(filename.length,28); entry.writeUInt32LE((0o100644<<16)>>>0,38); entry.writeUInt32LE(offset,42);
    directory.push(entry,filename);
    offset+=header.length+filename.length+compressed.length;
  }
  const central=Buffer.concat(directory), end=Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50,0);
  end.writeUInt16LE(files.size,8); end.writeUInt16LE(files.size,10);
  end.writeUInt32LE(central.length,12); end.writeUInt32LE(offset,16);
  return Buffer.concat([...blocks,central,end]);
}
