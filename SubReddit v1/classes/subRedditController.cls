public  class subRedditController {

    @AuraEnabled
    public  static list<SubReddit__c> subRedditSearchkey(String searchKey) {
        string searchKeyword = '%' + searchKey + '%';
		
        // create contact list to store search result 
         list<SubReddit__c> subRedditListRecord = new list<SubReddit__c>();
      
        // query contact records
         for(SubReddit__c subRObj : [Select id,Name, Category__c, No_Of_Upvotes__c,No_Of_Downvotes__c
                             From SubReddit__c
                             WHERE Name LIKE : searchKeyword]){
                                subRedditListRecord.add(subRObj);
                                system.System.debug('Name for loop'+subRObj.Name);
         }
         system.System.debug('for loop outside'+subRedditListRecord);

          if(subRedditListRecord.size() == 0){
             throw new AuraHandledException('No Record Found..'); 
          }
          
         return subRedditListRecord;
    }

    @AuraEnabled
    public static list<SubReddit__c> getSubRedditDefault(string noUseParameter){

        list<SubReddit__c> SubRedditListDefault = new list<SubReddit__c>();

        for(SubReddit__c SRObj : [Select id,Name, Category__c,No_Of_Downvotes__c,No_Of_Upvotes__c
        From SubReddit__c ORDER by No_Of_Upvotes__c desc NULLS LAST limit 10]){
            SubRedditListDefault.add(SRObj);
        }
       system.debug('noUseParameter :'+noUseParameter );
         if(SubRedditListDefault.size() == 0){
            throw new AuraHandledException('No Record Found..');
         }
         system.debug('SubRedditListDefault :'+SubRedditListDefault);

        return SubRedditListDefault;
    }
}