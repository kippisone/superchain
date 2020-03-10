export declare class Bucketchain {
  __buckets: any;
  debug: boolean;
  /**
   * Create new bucket in the bucket-chain
   * @param  {string} bucketName Bucket name
   *
   * @return {object} Returns the new chain instance
   */
  bucket(bucketName: string): any;
  /**
   * Returns a bucket by its name
   *
   * @param  {string} bucketName Bucket name
   * @return {object}            Returns a Bucket, which is a Superchain instance
   */
  get(bucketName: string): any;
  errorBucket(bucketName: any): Superchain;
  __errorBucket: Superchain;
  run(...args: any[]): any;
  clear(bucketName: any): void;
}

export declare class Superchain {
  constructor(conf?: any);
  debug: boolean;
  name: any;
  add(link: any): number;
  final(link: any): number;
  when(condition: any): any;
  run(ctx: any, ...args: any[]): any;
  runWith(
    thisContext: any,
    ctx: any,
    ...args: any[]
  ): {
    then(fn: any): any;
    catch(fn: any): any;
  };
  getLinkType(
    link: any
  ):
    | "string"
    | "number"
    | "bigint"
    | "boolean"
    | "symbol"
    | "undefined"
    | "object"
    | "function"
    | "array"
    | "null";
  clear(): void;
  __chain: any[];
  __final: any[];
  __subChains: any;
}

export default Superchain;
