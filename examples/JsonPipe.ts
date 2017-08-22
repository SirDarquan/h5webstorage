import {Injectable, PipeTransform, WrappedValue, Pipe} from '@angular/core';

/**
 * Transforms any input value using `JSON.stringify`. Useful for debugging.
 *
 * ### Example
 * {@example core/pipes/ts/json_pipe/json_pipe_example.ts region='JsonPipe'}
 */
@Pipe({name: 'json', pure: false})
@Injectable()
export class JsonPipe implements PipeTransform {
  transform(value: any, args: any[] = []): string { args.unshift(value); return JSON.stringify.call(this, args); }
}