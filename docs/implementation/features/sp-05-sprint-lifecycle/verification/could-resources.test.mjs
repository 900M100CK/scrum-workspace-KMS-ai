import test from 'node:test';import assert from 'node:assert/strict';import {assessResources} from './could-resources.mjs';
const original={containers:['old-container'],volumes:['old-volume']};
test('checks without Docker are not misreported as a leak; runtime cleanup remains required',()=>{
 const unknown={containers:null,volumes:null};assert.equal(assessResources(unknown,unknown,false).status,'not_applicable');assert.equal(assessResources(unknown,unknown,true).status,'unavailable');assert.equal(assessResources(original,unknown,true).status,'unavailable');assert.equal(assessResources(unknown,original,true).status,'unavailable');
});
test('pre-existing resources survive; only newly observed containers or volumes are flagged',()=>{
 assert.deepEqual(assessResources(original,original),{status:'clean',newContainers:[],newVolumes:[],message:'No new disposable resources observed'});
 const container=assessResources(original,{containers:['old-container','new-container'],volumes:['old-volume']});assert.equal(container.status,'leaked');assert.deepEqual(container.newContainers,['new-container']);assert.deepEqual(container.newVolumes,[]);
 const volume=assessResources(original,{containers:[],volumes:['old-volume','new-volume']});assert.equal(volume.status,'leaked');assert.deepEqual(volume.newVolumes,['new-volume']);assert.deepEqual(original,{containers:['old-container'],volumes:['old-volume']});
});
