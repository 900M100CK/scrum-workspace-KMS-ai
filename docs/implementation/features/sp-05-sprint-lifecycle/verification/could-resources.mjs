// This classifier never deletes resources or assumes an unavailable probe proves a leak.
export function assessResources(before,after,required=true){
 const unavailable=['containers','volumes'].some(k=>!Array.isArray(before?.[k])||!Array.isArray(after?.[k]));
 if(unavailable)return {status:required?'unavailable':'not_applicable',newContainers:null,newVolumes:null,message:required?'Docker resource state unavailable; cleanup not verified':'Checks phase owns no database resources; Docker probe unavailable, not evidence of a leak'};
 const newContainers=after.containers.filter(v=>!before.containers.includes(v)),newVolumes=after.volumes.filter(v=>!before.volumes.includes(v));
 return {status:newContainers.length||newVolumes.length?'leaked':'clean',newContainers,newVolumes,message:newContainers.length||newVolumes.length?'New disposable resources observed; inspect ownership':'No new disposable resources observed'};
}
