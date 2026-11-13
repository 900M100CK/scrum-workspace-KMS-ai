import {taskFixture} from './task-fixture.mjs';

export async function documentAuthorityFixture(){
 const fixture=await taskFixture({through:'016',count:3});
 return fixture;
}
