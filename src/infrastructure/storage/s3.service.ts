import { Injectable } from '@nestjs/common';

@Injectable()
export class S3Service {
  async upload(_path: string, _data: Buffer) {
    return { key: 'placeholder' };
  }
}
