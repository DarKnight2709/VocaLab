import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  get_factorial(n: number): number {
    import { factorial } from 'mathjs';
    return factorial(n);
  }

}
