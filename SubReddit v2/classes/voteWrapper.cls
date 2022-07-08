public with sharing class voteWrapper {
        @AuraEnabled
        public static list<SubredditWrapperClass1> subRedditWrapperMethod(Id userId) {
            List<SubredditWrapperClass1> wrapperList = new List<SubredditWrapperClass1>();
            SubredditWrapperClass1 WrapList;
            for(SubReddit__c subObj : [Select id
            , Name
            , Category__c
            , No_Of_Downvotes__c
            , No_Of_Upvotes__c
            , Owner.Name
            , Owner.id
            From SubReddit__c ORDER BY No_Of_Upvotes__c desc]){
                WrapList = new SubredditWrapperClass1();
                WrapList.subredditrec = subObj;
                
                for(Vote__c voteObj :[Select id
                , Vote__c
                , Source_Id__c
                , User__c 
                , CreatedDate
                from vote__c Where Source_Id__c =:subObj.id  AND  User__c =: userId  ORDER BY CreatedDate desc Limit 1]){
                    WrapList.voterec = voteObj;
                    WrapList.voteValue = voteObj.Vote__c;
                    if(voteObj.Vote__c == true){
                        WrapList.upLike = true;
                        WrapList.downLike = false;
                    }else  if(voteObj.Vote__c == false){
                        WrapList.upLike = false;
                        WrapList.downLike = true;
                    }else {
                        WrapList.upLike = true;
                        WrapList.downLike = true;
                    }
            }
             wrapperList.add(WrapList);
    
        }
        if(wrapperList.size() == 0){
            throw new AuraHandledException('No Record Found..');
         }
         for(SubredditWrapperClass1 ls:wrapperList){
            system.debug('wrapperList '+ls);
         }
        return wrapperList;
    }
        public class SubredditWrapperClass1{
            @AuraEnabled
            public SubReddit__c subredditrec;
            @AuraEnabled
            public Vote__c voterec;
            @AuraEnabled
            public Boolean voteValue;
            @AuraEnabled
            public Boolean upLike;
            @AuraEnabled
            public Boolean downLike;
        }





















// @AuraEnabled
// public static list<SubredditWrapperClass1> subRedditWrapperMethod(Id userId) {
//     List<SubredditWrapperClass1> ls = new List<SubredditWrapperClass1>();

// list<SubReddit__c> subRedditList = [Select id
// , Name
// , Category__c
// , No_Of_Downvotes__c
// , No_Of_Upvotes__c
// , Owner.Name
// , Owner.id
// From SubReddit__c ORDER BY No_Of_Upvotes__c desc];
      
       
// list<Vote__c> voteList = [Select id
//         , Vote__c
//         , Source_Id__c
//         , User__c
//         from vote__c Where  User__c =: userId];

// SubredditWrapperClass1 wrapperList = new SubredditWrapperClass1();
// wrapperList.subredditrec=subRedditList;
// wrapperList.voterec=voteList;
// ls.add(wrapperList);
// for(SubredditWrapperClass1 ls1: ls){
//     system.debug('SubredditWrapperClass1 '+ls1);
//     }
//     return ls;
//     }

//     //Wrapper Class
//         public class SubredditWrapperClass1{
//         @AuraEnabled public List<SubReddit__c> subredditrec;
//         @AuraEnabled public List<Vote__c> voterec;


        // public SubredditWrapperClass1(List<SubReddit__c> subredditrec,
        //                              List<Vote__c> voterec
        //                               ){
        //     this.subredditrec = subredditrec;
        //     this.voterec = voterec;
        // }
}