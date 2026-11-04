import {taskFixture} from './task-fixture.mjs';

// New suites opt in explicitly; the original session/project/Task ceilings remain 006/008/009.
export async function taskMutationFixture({through='010'}={}){
 if(!['009','010'].includes(through))throw Error('Mutation fixture requires an explicit 009/010 ceiling');
 return taskFixture({through});
}
