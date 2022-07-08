public with sharing class postController {
    @AuraEnabled
    public  static list<Post__c> postSearchkey(String postSearchKey, id redditids) {
        string PostearchKeyword = '%' + postSearchKey + '%';
		
        // create contact list to store search result 
         list<Post__c> postSearchListRecords = new list<Post__c>();
      
        // query contact records
         for(Post__c postObj : [Select id,Name, No_Of_Comments__c,SubReddit__c, Body__c,Title__c, No_Of_Upvotes__c,No_Of_Downvotes__c
                             From Post__c
                             WHERE Name LIKE : PostearchKeyword AND SubReddit__c=:redditids]){
                                postSearchListRecords.add(postObj);
                                system.System.debug('Name for loop'+postObj.Name);
         }
         system.System.debug('for loop outside'+postSearchListRecords);

          if(postSearchListRecords.size() == 0){
             throw new AuraHandledException('No Record Found..'); 
          }   
         return postSearchListRecords;
    }

    @AuraEnabled
    public static list<Post__c> getpostDefault(id redditIdForDefault){

        list<Post__c> postListDefault = new list<Post__c>();

        for(Post__c SRObj : [Select id,Name, No_Of_Comments__c,SubReddit__c, Body__c, Title__c, No_Of_Upvotes__c,No_Of_Downvotes__c
        From Post__c where SubReddit__c=:redditIdForDefault ORDER by No_Of_Upvotes__c desc NULLS LAST limit 10]){
            postListDefault.add(SRObj);
        }
       system.debug('noUseParameter :' );
         if(postListDefault.size() == 0){
            throw new AuraHandledException('No Record Found..');
         }
         system.debug('postListDefault :'+postListDefault);

        return postListDefault;
    }
}