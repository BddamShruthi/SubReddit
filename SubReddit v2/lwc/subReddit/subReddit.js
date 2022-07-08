import { LightningElement, track } from 'lwc';
import {updateRecord, createRecord } from "lightning/uiRecordApi";
import SUBREDDIT_ID_FIELD from "@salesforce/schema/SubReddit__c.Id";
import SUBREDDIT_UPVOTES_FIELD from "@salesforce/schema/SubReddit__c.No_Of_Upvotes__c";
import SUBREDDIT_DOWNVOTES_FIELD from "@salesforce/schema/SubReddit__c.No_Of_Downvotes__c";
import VOTE_OBJECT from "@salesforce/schema/Vote__c";
import VOTE_SOURCEID_FIELD from "@salesforce/schema/Vote__c.Source_Id__c";
import VOTE_VOTECHECKBOX_FIELD from "@salesforce/schema/Vote__c.Vote__c";
import USER from '@salesforce/schema/Vote__c.User__c';
import VOTE_ID_FIELD from "@salesforce/schema/Vote__c.Id";
import getSubRedditList from '@salesforce/apex/subRedditController.subRedditSearchkey';
import getSubRedditDef from '@salesforce/apex/voteWrapper.subRedditWrapperMethod';
import { NavigationMixin } from 'lightning/navigation';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import Id from '@salesforce/user/Id';

export default class SubReddit extends NavigationMixin(LightningElement)  {
  
    @track onloadbody = false;
    @track userId=Id;
    @track subRedditSearchRecords=[];
    @track searchValue = '';
    @track subRedditDefaultRecord=[];
    @track isModalOpen = false;
    @track upvotesMap = new Map();
    @track downvotesMap = new Map();
    @track searchempty = true;
    

    openModal() {
        this.onloadbody = true;
        // to open modal set isModalOpen tarck value as true
        this.isModalOpen = true;
    }
    closeModal() {
        this.onloadbody = false;
        // to close modal set isModalOpen tarck value as false
        this.isModalOpen = false;
    }

    //Calling Connected callback
    connectedCallback() {
        this.onloadbody = false;
       // this.getData();
    }

    //Calling apex class to show all subreddit records
    getData() {
        //this.onloadbody = true;
    getSubRedditDef({
        userId : this.userId
    })
    .then(result => {
        this.onloadbody = false;
        this.subRedditDefaultRecord = result;
    })
    .catch(error => {
        console.log('result :'+error);
        const event = new ShowToastEvent({
            title: 'Error',
            variant: 'error',
            message: error.body.message,
        });
        this.dispatchEvent(event);
        // reset contacts var with null   
        this.subRedditDefaultRecord = null;
    });
}


renderedCallback() {
    this.getData();
//     this.subRedditDefaultRecord.forEach(element => {
//         let btnVisible = this.template.querySelectorAll("[data-record-id='" + element.subredditrec.Id + "']");
//         if(element.upLike == true){
//         btnVisible[0].disabled = true;
//         btnVisible[1].disabled = false;
//         }else{
//             btnVisible[0].disabled = false;
//             btnVisible[1].disabled = true;
//         }
//     });
 }

   //After creating Subreddit showing Toast popup
    handleSuccess( event ) {
        this.onloadbody = true;
        console.log( 'Record Id is ' + event.detail.id );
        this.dispatchEvent(
            new ShowToastEvent( {
                title: 'Subreddit Submission Result',
                message: 'Subreddit Created Successfully',
                variant: 'success',
                mode: 'sticky'
            } )
        );
        this.isModalOpen = false;
        this.onloadbody = false;

        this.getData();
    }

    // update searchValue var when input field value change
    searchKeyword(event) {
        this.searchValue = event.target.value;
        if (this.searchValue !== '') {
            this.searchempty = false;
            getSubRedditList({
                    searchKey: this.searchValue,
                    userId : this.userId
                })
                .then(result => {
                    this.subRedditSearchRecords = result;
                    console.log('*this.subRedditSearchRecords*'+JSON.stringify(this.subRedditSearchRecords));
                   // this.onloadbody = true;
                    /*this.subRedditSearchRecords.forEach((element, index) => {
                        this.upvotesMap.set(index,element.No_Of_Upvotes__c);
                    });
                    console.log('*this.upvotesMap*'+JSON.stringify(this.upvotesMap));*/
                })
                .catch(error => {
                    console.log('result :'+error); 
                    this.subRedditSearchRecords = null;
                });
        }
        if (this.searchValue == ''){
            this.searchempty=true;
        }
    }

   // Navigate to Aura component to see the post details
    handleNoficationMore(event){  
        let redditRecordName;
        let rowId = event.target.dataset.recordId;
        let recindex = event.currentTarget.dataset.index;

    if(this.subRedditSearchRecords ==''){
         redditRecordName = this.subRedditDefaultRecord[recindex].Name;
    }
     else {
        redditRecordName = this.subRedditSearchRecords[recindex].Name;
    }

        this[NavigationMixin.Navigate]({
            type: "standard__component",
            attributes: {
                componentName: "c__navigateToPost"
            },
            state: {
                c__redditid: rowId,
                c__redditName: redditRecordName
            }
        });

        // this[NavigationMixin.Navigate]({
        //     type: 'standard__recordPage',
        //     attributes: {
        //         recordId: rowId,
        //         objectApiName: 'SubReddit__c', // objectApiName is optional
        //         actionName: 'view'
        //      }
        //  });
     }


     onClickVote(event){
        this.onloadbody = true;
        let recordsToProcess =[];
        let recId = event.target.dataset.recordId;
        let recindex = event.target.dataset.index;
        if(this.subRedditSearchRecords == 0){
            recordsToProcess = this.subRedditDefaultRecord;
        }else {
            recordsToProcess = this.subRedditSearchRecords;
        }
        let upvoteCount = recordsToProcess[recindex].subredditrec.No_Of_Upvotes__c;
        let downVotecount = recordsToProcess[recindex].subredditrec.No_Of_Downvotes__c;

    if(event.target.name === "UpLike"){
        upvoteCount = recordsToProcess[recindex].subredditrec.No_Of_Upvotes__c + 1;
        if(recordsToProcess[recindex].subredditrec.No_Of_Downvotes__c >0 && recordsToProcess[recindex].voterec != null){
        downVotecount = recordsToProcess[recindex].subredditrec.No_Of_Downvotes__c - 1;
        }
        if(recordsToProcess[recindex].voterec != null && recordsToProcess[recindex].voterec.Vote__c == true){
            recordsToProcess[recindex].upLike = true;
            recordsToProcess[recindex].downLike = false;
        }else if(recordsToProcess[recindex].voterec != null && recordsToProcess[recindex].voterec.Vote__c == false){
            recordsToProcess[recindex].upLike = true;
            recordsToProcess[recindex].downLike = false;
        }else{
            recordsToProcess[recindex].upLike = true;
            recordsToProcess[recindex].downLike = false;
        }
        this.voteCreation(event);
       try{
        recordsToProcess[recindex].subredditrec.No_Of_Upvotes__c =  recordsToProcess[recindex].subredditrec.No_Of_Upvotes__c + 1;
        if(recordsToProcess[recindex].subredditrec.No_Of_Downvotes__c > 0 && recordsToProcess[recindex].voterec != null){
        recordsToProcess[recindex].subredditrec.No_Of_Downvotes__c =  recordsToProcess[recindex].subredditrec.No_Of_Downvotes__c - 1;
        }
       }
       catch(err){
        console.log('catch error: '+err.message);
       }
    }
    if(event.target.name === "DownLike"){
        downVotecount = recordsToProcess[recindex].subredditrec.No_Of_Downvotes__c + 1;
        if(recordsToProcess[recindex].subredditrec.No_Of_Upvotes__c >0 && recordsToProcess[recindex].voterec != null){
        upvoteCount = recordsToProcess[recindex].subredditrec.No_Of_Upvotes__c - 1;
        }
        if(recordsToProcess[recindex].voterec != null && recordsToProcess[recindex].voterec.Vote__c == false){
            recordsToProcess[recindex].downLike = true;
            recordsToProcess[recindex].upLike = false;
        }else if(recordsToProcess[recindex].voterec != null && recordsToProcess[recindex].voterec.Vote__c == true){
            recordsToProcess[recindex].downLike = true;
            recordsToProcess[recindex].upLike = false;
        }else{
            recordsToProcess[recindex].upLike = false;
            recordsToProcess[recindex].downLike = true;
        }

        this.voteCreation(event);
       try{
        recordsToProcess[recindex].subredditrec.No_Of_Downvotes__c =  recordsToProcess[recindex].subredditrec.No_Of_Downvotes__c + 1;
        if(recordsToProcess[recindex].subredditrec.No_Of_Upvotes__c >0 && recordsToProcess[recindex].voterec != null){
        recordsToProcess[recindex].subredditrec.No_Of_Upvotes__c =  recordsToProcess[recindex].subredditrec.No_Of_Upvotes__c - 1;
        }
        this.onloadbody = false;
       }catch(err){
        console.log('catch error: '+err.message);
       }
    }
    
    const fields ={};
  
    const recordInput = {
        fields: fields
        };
    fields[SUBREDDIT_ID_FIELD.fieldApiName]= recId;
    fields[SUBREDDIT_UPVOTES_FIELD.fieldApiName] = upvoteCount;
    fields[SUBREDDIT_DOWNVOTES_FIELD.fieldApiName] = downVotecount;
    updateRecord(recordInput)
    .then((data) => console.log(data))
    .catch((error) => console.log(error));
}

voteCreation(event){
    this.onloadbody = true;
    let recordsToProcess =[];
    let recindex = event.currentTarget.dataset.index;
    if(this.subRedditSearchRecords == 0){
        recordsToProcess = this.subRedditDefaultRecord;
    }else {
        recordsToProcess = this.subRedditSearchRecords;
    }
    if(recordsToProcess[recindex].voterec == null){
        const fields ={};
        fields[VOTE_SOURCEID_FIELD.fieldApiName] = event.target.dataset.recordId;
        if(event.target.name === "UpLike"){
            fields[VOTE_VOTECHECKBOX_FIELD.fieldApiName] = true;
        }else{
            fields[VOTE_VOTECHECKBOX_FIELD.fieldApiName] = false;
        }
        fields[USER.fieldApiName] =this.userId;
        
        const recordInput = {
            apiName: VOTE_OBJECT.objectApiName,
            fields: fields
        };
        createRecord(recordInput)
        .then(result => {console.log(result)})
        this.onloadbody = false;
        if(this.searchValue !== ''){
            this.searchKeyword(event);
        }
    }
    else{
    const fields ={};

    const recordInput = {
        fields: fields
        };
    fields[VOTE_ID_FIELD.fieldApiName]= recordsToProcess[recindex].voterec.Id;
    if(recordsToProcess[recindex].voterec.Vote__c == true){
        fields[VOTE_VOTECHECKBOX_FIELD.fieldApiName] = false;
    } else{
        fields[VOTE_VOTECHECKBOX_FIELD.fieldApiName] = true;
    }
    updateRecord(recordInput)
    .then((data) => console.log(data))
    .catch((error) => console.log(error));
    }
}
}







//     //UpVote and downVote logic starts here
//     onClickVote(event){
     
//         let recId = event.target.dataset.recordId;
//         let recindex = event.currentTarget.dataset.index;
//         console.log('index: '+recindex);

//         let subRedditRecordVote=[];
//         if(this.subRedditSearchRecords == 0 ){
//             subRedditRecordVote = this.subRedditDefaultRecord;
//        }
//         else {
//             subRedditRecordVote = this.subRedditSearchRecords;
//        }
        
     
//         let upvoteCount = subRedditRecordVote[recindex].No_Of_Upvotes__c;
//         let downVotecount = subRedditRecordVote[recindex].No_Of_Downvotes__c;
        
//     if(event.target.name === "UpLike"){
//         console.log('before: '+subRedditRecordVote[recindex].No_Of_Upvotes__c);
//         upvoteCount = subRedditRecordVote[recindex].No_Of_Upvotes__c + 1;
//        try{
//         subRedditRecordVote[recindex].No_Of_Upvotes__c = subRedditRecordVote[recindex].No_Of_Upvotes__c + 1;
//        }catch(err){
//         console.log('catch error: '+err.message);
//        }
        
//         console.log('after: '+subRedditRecordVote[recindex].No_Of_Upvotes__c);
//     }
    
//     if(event.target.name === "DownLike"){
//         downVotecount = subRedditRecordVote[recindex].No_Of_Downvotes__c + 1;
//        try{
//         subRedditRecordVote[recindex].No_Of_Downvotes__c =  subRedditRecordVote[recindex].No_Of_Downvotes__c + 1;
//        }catch(err){
//         console.log('catch error: '+err.message);
//        }
        
//         console.log('after: '+subRedditRecordVote[recindex].No_Of_Downvotes__c);
//     }
    
//     const fields ={};
  
//     const recordInput = {
//         fields: fields
//         };

//     fields[SUBREDDIT_ID_FIELD.fieldApiName]= recId;
//     fields[SUBREDDIT_UPVOTES_FIELD.fieldApiName] =upvoteCount;
//     fields[SUBREDDIT_DOWNVOTES_FIELD.fieldApiName] =downVotecount;

    
//     updateRecord(recordInput)
    
//     .then((data) => console.log('data update: '+JSON.stringify(data)))
//     .catch((error) => console.log(error));
    
//     this.voteCreation(event);
// }


// voteCreation(event){
//  let recId = event.target.dataset.recordId;
// console.log('recId :'+recId);
//     const fields ={};

//     fields[VOTE_SOURCEID_FIELD.fieldApiName] = recId;
//     fields[VOTE_VOTECHECKBOX_FIELD.fieldApiName] = true;
//     fields[VOTE_SUBREDDIT_FIELD.fieldApiName] = recId;
//     const recordInput = {
//         apiName: VOTE_OBJECT.objectApiName,
//         fields: fields
//     };
//     createRecord(recordInput)
//     .then((data) => console.log(data))
//     .catch((error) => console.log(error));
//     }