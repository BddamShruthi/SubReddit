public  class subRedditController {
    @AuraEnabled
    public static list<SubredditWrapperClass1> subRedditSearchkey(Id userId, String searchKey) {

        string searchKeyword = '%' + searchKey + '%';

        List<SubredditWrapperClass1> wrapperList = new List<SubredditWrapperClass1>();
        SubredditWrapperClass1 WrapListForSearch;
        for(SubReddit__c subObj : [Select id
        , Name
        , Category__c
        , No_Of_Downvotes__c
        , No_Of_Upvotes__c
        , Owner.Name
        , Owner.id
        From SubReddit__c WHERE Name LIKE : searchKeyword ORDER BY No_Of_Upvotes__c desc]){
            WrapListForSearch = new SubredditWrapperClass1();
            WrapListForSearch.subredditrec = subObj;
            
            for(Vote__c voteObj :[Select id
            , Vote__c
            , Source_Id__c
            , User__c 
            , CreatedDate
            from vote__c Where Source_Id__c =:subObj.id  AND  User__c =: userId  ORDER BY CreatedDate desc Limit 1]){
                WrapListForSearch.voterec = voteObj;
                WrapListForSearch.voteValue = voteObj.Vote__c;
                if(voteObj.Vote__c == true){
                    WrapListForSearch.upLike = true;
                    WrapListForSearch.downLike = false;
                }else  if(voteObj.Vote__c == false){
                    WrapListForSearch.upLike = false;
                    WrapListForSearch.downLike = true;
                }else {
                    WrapListForSearch.upLike = true;
                    WrapListForSearch.downLike = true;
                }
        }
         wrapperList.add(WrapListForSearch);

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
}

















    // @AuraEnabled
    // public  static list<SubReddit__c> subRedditSearchkey(String searchKey) {
    //     string searchKeyword = '%' + searchKey + '%';
		
    //     // create contact list to store search result 
    //      list<SubReddit__c> subRedditListRecord = new list<SubReddit__c>();
      
    //     // query contact records
    //      for(SubReddit__c subRObj : [Select id,Name, Category__c, No_Of_Upvotes__c,No_Of_Downvotes__c
    //                          From SubReddit__c
    //                          WHERE Name LIKE : searchKeyword]){
    //                             subRedditListRecord.add(subRObj);
    //                             system.System.debug('Name for loop'+subRObj.Name);
    //      }
    //      system.System.debug('for loop outside'+subRedditListRecord);

    //       if(subRedditListRecord.size() == 0){
    //          throw new AuraHandledException('No Record Found..'); 
    //       }
          
    //      return subRedditListRecord;
    // }

    // @AuraEnabled
    // public static list<SubReddit__c> getSubRedditDefault(string noUseParameter){

    //     list<SubReddit__c> SubRedditListDefault = new list<SubReddit__c>();

    //     for(SubReddit__c SRObj : [Select id,Name, Category__c,No_Of_Downvotes__c,No_Of_Upvotes__c
    //     From SubReddit__c ORDER by No_Of_Upvotes__c desc NULLS LAST limit 100]){
    //         SubRedditListDefault.add(SRObj);
    //     }
    //    system.debug('noUseParameter :'+noUseParameter );
    //      if(SubRedditListDefault.size() == 0){
    //         throw new AuraHandledException('No Record Found..');
    //      }
    //      system.debug('SubRedditListDefault :'+SubRedditListDefault);

    //     return SubRedditListDefault;
    // }