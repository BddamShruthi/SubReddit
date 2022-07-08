public with sharing class commentController {
    @AuraEnabled
    public static list<CommentsWrapperClass> getCommentRecords(id postIdFromLwc){

        list<CommentsWrapperClass> commentListDefault = new list<CommentsWrapperClass>();
        CommentsWrapperClass newWrapper;

        for(Comment__c CM : [Select id
        , Name 
        , Post__c
        , Upvotes__c
        , DownVotes__c
        , Body__c
        , CreatedBy.name
        , CreatedBy.FirstName
        , CreatedBy.CreatedDate 
        , (Select id
        , Name
        , Comment__c
        , Post__c
        , Upvotes__c
        , DownVotes__c
        , Body__c
        , CreatedBy.name
        , CreatedBy.FirstName
        , CreatedBy.CreatedDate
        From Comments__r)
        From Comment__c where Post__c=:postIdFromLwc AND Comment__c = Null ORDER by Upvotes__c desc NULLS LAST limit 10]){

            newWrapper = new CommentsWrapperClass();
            newWrapper.parentComment = CM;
            newWrapper.childRecs= CM.Comments__r;
            commentListDefault.add(newWrapper);
        }
         if(commentListDefault.size() == 0){
            throw new AuraHandledException('No Record Found..');
         }
         system.debug('commentListDefault :'+commentListDefault);
        return commentListDefault;
    }


    public class CommentsWrapperClass{
        @AuraEnabled 
        public Comment__c parentComment;
        @AuraEnabled 
        public List<Comment__c> childRecs;
    }
}