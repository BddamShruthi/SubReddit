public with sharing class commentController {
    @AuraEnabled
    public static list<CommentsWrapperClass> getCommentRecords(Id userId, Id postIdFromLwc){

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
        From Comment__c where Post__c=:postIdFromLwc AND Comment__c = Null ORDER by Upvotes__c desc NULLS LAST limit 100]){

            newWrapper = new CommentsWrapperClass();
            newWrapper.parentComment = CM;
            newWrapper.childRecs= CM.Comments__r;

            for(Vote__c voteObj :[Select id
            , Vote__c
            , Source_Id__c
            , User__c 
            , CreatedDate
            from vote__c Where Source_Id__c =:CM.id  AND  User__c =: userId  ORDER BY CreatedDate desc Limit 1]){
                newWrapper.voterec = voteObj;
                if(voteObj.Vote__c == true){
                    newWrapper.upLike = true;
                    newWrapper.downLike = false;
                }else  if(voteObj.Vote__c == false){
                    newWrapper.upLike = false;
                    newWrapper.downLike = true;
                }else {
                    newWrapper.upLike = true;
                    newWrapper.downLike = true;
                }
        }
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
        @AuraEnabled
        public Vote__c voterec;
        @AuraEnabled
        public Boolean upLike;
        @AuraEnabled
        public Boolean downLike;
    }
}