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
import { NavigationMixin } from 'lightning/navigation';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import Id from '@salesforce/user/Id';

export default class SubReddit extends NavigationMixin(LightningElement)  {
  
    @track userId=Id;
    @track subRedditSearchRecords=[];
    @track searchValue = '';
    @track subRedditDefaultRecord=[];
    @track isModalOpen = false;
    @track upvotesMap = new Map();
    @track downvotesMap = new Map();
    @track areDetailsVisible=false;


    openModal() {
        // to open modal set isModalOpen tarck value as true
        this.isModalOpen = true; 
    }
    
    closeModal() {
        // to close modal set isModalOpen tarck value as false
        this.isModalOpen = false;
    }

    //Calling Connected callback
    connectedCallback() {
        this.getData();
    }

    //Calling apex class to show all subreddit records
    getData() {
        getSubRedditList({
        searchKey: '',
        userId : this.userId
    })
    .then(result => {
        this.subRedditSearchRecords = result;
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
        this.subRedditSearchRecords = null;
    });
}


//renderedCallback() {
    // this.getData();

//     this.subRedditSearchRecords.forEach(element => {
//         let btnVisible = this.template.querySelectorAll("[data-record-id='" + element.subredditrec.Id + "']");
//         if(element.upLike == true){
//         btnVisible[0].disabled = true;
//         btnVisible[1].disabled = false;
//         }else{
//             btnVisible[0].disabled = false;
//             btnVisible[1].disabled = true;
//         }
//     });
 //}

   //After creating Subreddit showing Toast popup
    handleSuccess( event ) {
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

        this.getData();
    }

    // update searchValue var when input field value change
    searchKeyword(event) {

        this.searchValue = event.target.value;
        if (this.searchValue !== '') {
            getSubRedditList({
                    searchKey: this.searchValue,
                    userId : this.userId
                })
                .then(result => {
                    this.subRedditSearchRecords = result;
                    console.log('*this.subRedditSearchRecords*'+JSON.stringify(this.subRedditSearchRecords));
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
            this.getData();
        }
    }

   // Navigate to Aura component to see the post details
    handleNoficationMore(event){  
        let rowId = event.target.dataset.recordId;
        let recindex = event.currentTarget.dataset.index;

       let redditRecordName = this.subRedditSearchRecords[recindex].subredditrec.Name;

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
        let recId = event.target.dataset.recordId;
        let recindex = event.target.dataset.index;
        
        let upvoteCount = this.subRedditSearchRecords[recindex].subredditrec.No_Of_Upvotes__c;
        let downVotecount = this.subRedditSearchRecords[recindex].subredditrec.No_Of_Downvotes__c;

    if(event.target.name === "UpLike"){
        upvoteCount = this.subRedditSearchRecords[recindex].subredditrec.No_Of_Upvotes__c + 1;
        if(this.subRedditSearchRecords[recindex].subredditrec.No_Of_Downvotes__c >0 ){
        downVotecount = this.subRedditSearchRecords[recindex].subredditrec.No_Of_Downvotes__c - 1;
        }
        if(this.subRedditSearchRecords[recindex].voterec != null && this.subRedditSearchRecords[recindex].voterec.Vote__c == true){
            this.subRedditSearchRecords[recindex].upLike = true;
            this.subRedditSearchRecords[recindex].downLike = false;
        }else if(this.subRedditSearchRecords[recindex].voterec != null && this.subRedditSearchRecords[recindex].voterec.Vote__c == false){
            this.subRedditSearchRecords[recindex].upLike = true;
            this.subRedditSearchRecords[recindex].downLike = false;
        }else{
            this.subRedditSearchRecords[recindex].upLike = true;
            this.subRedditSearchRecords[recindex].downLike = false;
        }
       
       try{
        this.subRedditSearchRecords[recindex].subredditrec.No_Of_Upvotes__c =  this.subRedditSearchRecords[recindex].subredditrec.No_Of_Upvotes__c + 1;
        if(this.subRedditSearchRecords[recindex].subredditrec.No_Of_Downvotes__c > 0 ){
        this.subRedditSearchRecords[recindex].subredditrec.No_Of_Downvotes__c =  this.subRedditSearchRecords[recindex].subredditrec.No_Of_Downvotes__c - 1;
        }
       }
       catch(err){
        console.log('catch error: '+err.message);
       }
       this.voteCreation(event);
    }
    if(event.target.name === "DownLike"){
        downVotecount = this.subRedditSearchRecords[recindex].subredditrec.No_Of_Downvotes__c + 1;
        if(this.subRedditSearchRecords[recindex].subredditrec.No_Of_Upvotes__c >0 ){
        upvoteCount = this.subRedditSearchRecords[recindex].subredditrec.No_Of_Upvotes__c - 1;
        }
        if(this.subRedditSearchRecords[recindex].voterec != null && this.subRedditSearchRecords[recindex].voterec.Vote__c == false){
            this.subRedditSearchRecords[recindex].downLike = true;
            this.subRedditSearchRecords[recindex].upLike = false;
        }else if(this.subRedditSearchRecords[recindex].voterec != null && this.subRedditSearchRecords[recindex].voterec.Vote__c == true){
            this.subRedditSearchRecords[recindex].downLike = true;
            this.subRedditSearchRecords[recindex].upLike = false;
        }else{
            this.subRedditSearchRecords[recindex].upLike = false;
            this.subRedditSearchRecords[recindex].downLike = true;
        }
       
      
       try{
        this.subRedditSearchRecords[recindex].subredditrec.No_Of_Downvotes__c =  this.subRedditSearchRecords[recindex].subredditrec.No_Of_Downvotes__c + 1;
        if(this.subRedditSearchRecords[recindex].subredditrec.No_Of_Upvotes__c >0){
        this.subRedditSearchRecords[recindex].subredditrec.No_Of_Upvotes__c =  this.subRedditSearchRecords[recindex].subredditrec.No_Of_Upvotes__c - 1;
        }
       }catch(err){
        console.log('catch error: '+err.message);
       }
       this.voteCreation(event);
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
    let recindex = event.target.dataset.index;
    if(this.subRedditSearchRecords[recindex].voterec == null){
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
        this.getData();
        if(this.searchValue !== ''){
            this.searchKeyword(event);
        } else{
            this.getData();
        }
    }
    else{
    const fields ={};

    const recordInput = {
        fields: fields
        };
    fields[VOTE_ID_FIELD.fieldApiName]= this.subRedditSearchRecords[recindex].voterec.Id;
    if(this.subRedditSearchRecords[recindex].voterec.Vote__c == true){
        fields[VOTE_VOTECHECKBOX_FIELD.fieldApiName] = false;
    } else if(this.subRedditSearchRecords[recindex].voterec.Vote__c == false){
        fields[VOTE_VOTECHECKBOX_FIELD.fieldApiName] = true;
    }
    updateRecord(recordInput)
    .then((data) => console.log(data))
    .catch((error) => console.log(error));
    }
}
}