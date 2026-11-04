import type {PoolClient} from 'pg';

// Grant predicate only; callers retain current membership/read scope and transaction ordering.
export async function hasCapability(c:PoolClient,actor:string,projectId:string,action:string):Promise<boolean>{
 return !!(await c.query("SELECT 1 FROM workspace.capability_grant WHERE project_id=$1 AND subject_id=$2 AND resource_kind='project' AND resource_id=$1 AND action=$3 AND valid LIMIT 1",[projectId,actor,action])).rowCount;
}
