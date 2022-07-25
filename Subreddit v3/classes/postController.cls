public with sharing class postController {

    @AuraEnabled
    public  static list<postWrapperClass> postSearchkey(String postSearchKey, id redditids, Id userId) {
        string PostearchKeyword = '%' + postSearchKey + '%';

        String soqlQuery = 'Select id,Name, No_Of_Comments__c,SubReddit__c, Body__c,Title__c, No_Of_Upvotes__c,No_Of_Downvotes__c' +
        ' From Post__c';
 
if(postSearchKey!= ''){
    soqlQuery += ' WHERE Name LIKE : PostearchKeyword AND SubReddit__c=:redditids ORDER BY No_Of_Upvotes__c desc';
}else{
    soqlQuery += ' WHERE SubReddit__c=:redditids ORDER BY No_Of_Upvotes__c desc';
}
//list<Post__c> obj = database.query(soqlQuery);
system.debug('soqlQuery :'+database.query(soqlQuery));
system.debug('soqlQuery :'+soqlQuery);
		
List<postWrapperClass> wrapperList = new List<postWrapperClass>();
postWrapperClass WrapListForSearch;
      
        // query contact records
         for(Post__c postObj : database.query(soqlQuery)){
            WrapListForSearch = new postWrapperClass();
            WrapListForSearch.postRec = postObj;

            for(Vote__c voteObj :[Select id
            , Vote__c
            , Source_Id__c
            , User__c 
            , CreatedDate
            from vote__c Where Source_Id__c =:postObj.id  AND  User__c =: userId  ORDER BY CreatedDate desc Limit 1]){
                WrapListForSearch.voterec = voteObj;
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
         return wrapperList;
    }

    public class postWrapperClass{
        @AuraEnabled public Post__c postRec;
        @AuraEnabled public Vote__c voterec;
        @AuraEnabled public Boolean upLike;
        @AuraEnabled public Boolean downLike;
    }









    // @AuraEnabled
    // public static list<Post__c> getpostDefault(id redditIdForDefault){

    //     list<Post__c> postListDefault = new list<Post__c>();

    //     for(Post__c SRObj : [Select id,Name, No_Of_Comments__c,SubReddit__c, Body__c, Title__c, No_Of_Upvotes__c,No_Of_Downvotes__c
    //     From Post__c where SubReddit__c=:redditIdForDefault ORDER by No_Of_Upvotes__c desc NULLS LAST limit 10]){
    //         postListDefault.add(SRObj);
    //     }
    //    system.debug('noUseParameter :' );
    //      if(postListDefault.size() == 0){
    //         throw new AuraHandledException('No Record Found..');
    //      }
    //      system.debug('postListDefault :'+postListDefault);

    //     return postListDefault;
    // }
}