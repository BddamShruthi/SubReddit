public with sharing class commentController {
    @AuraEnabled
    public static list<Comment__c> getCommentRecords(id postIdFromLwc){

        list<Comment__c> commentListDefault = new list<Comment__c>();

        for(Comment__c SRObj : [Select id
        , Name 
        , Post__c
        , Upvotes__c
        , DownVotes__c,Body__c
        , CreatedBy.name
        , CreatedBy.FirstName
        , CreatedBy.CreatedDate
        From Comment__c where Post__c=:postIdFromLwc AND Comment__c=null ORDER by Upvotes__c desc NULLS LAST limit 10]){
            commentListDefault.add(SRObj);
        }
         if(commentListDefault.size() == 0){
            throw new AuraHandledException('No Record Found..');
         }
         system.debug('commentListDefault :'+commentListDefault);

        return commentListDefault;
    }

    @AuraEnabled
    public static list<Comment__c> getchildCommentRecords( id parentCommentId, id postIdFromLwc){

        list<Comment__c> childCommentList = new list<Comment__c>();

        for(Comment__c SRObj : [Select id
        , Name 
        , Post__c
        , Upvotes__c
        , DownVotes__c,Body__c
        , CreatedBy.name
        , CreatedBy.FirstName
        , CreatedBy.CreatedDate
        From Comment__c where Comment__c=:parentCommentId AND Post__c=:postIdFromLwc ORDER by Upvotes__c desc NULLS LAST limit 10]){
            childCommentList.add(SRObj);
        }
         if(childCommentList.size() == 0){
            throw new AuraHandledException('No Record Found..');
         }
         system.debug('commentListDefault :'+childCommentList);

        return childCommentList;
    }

}