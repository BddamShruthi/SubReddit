import { api, LightningElement, track, wire } from 'lwc';

import {updateRecord } from "lightning/uiRecordApi";
import SUBREDDIT_ID_FIELD from "@salesforce/schema/SubReddit__c.Id";
import SUBREDDIT_UPVOTES_FIELD from "@salesforce/schema/SubReddit__c.No_Of_Upvotes__c";
import SUBREDDIT_DOWNVOTES_FIELD from "@salesforce/schema/SubReddit__c.No_Of_Downvotes__c";
import getSubRedditList from '@salesforce/apex/subRedditController.subRedditSearchkey';
import getSubRedditDef from '@salesforce/apex/subRedditController.getSubRedditDefault';
import { NavigationMixin } from 'lightning/navigation';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';


export default class SubReddit extends NavigationMixin(LightningElement)  {

    @track subRedditRecord;
    @track searchValue = '';
    @track subRedditRecord2;
    @track isModalOpen = false;
    @track upvotesMap = new Map();
    @track downvotesMap = new Map();
    @track searchempty = true;

    openModal() {
        // to open modal set isModalOpen tarck value as true
        this.isModalOpen = true;
    }
    closeModal() {
        // to close modal set isModalOpen tarck value as false
        this.isModalOpen = false;
    }
    connectedCallback() {
        this.getData();
    }
    getData() {
    getSubRedditDef({
        noUseParameter:'test'
    })
    .then(result => {
        this.subRedditRecord2 = result;
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
        this.subRedditRecord2 = null;
    });
}

    handleNoficationMore(event){  

        let rowId = event.target.dataset.recordId;
        console.log( "Record Id is "+ JSON.stringify( rowId ) );
        let recindex = event.currentTarget.dataset.index;
    console.log('index: '+recindex);
  
    let redditRecordName = this.subRedditRecord2[recindex].Name;
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
    }
    // update searchValue var when input field value change
    searchKeyword(event) {
        this.searchValue = event.target.value;
        if (this.searchValue !== '') {
            this.searchempty = false;
            getSubRedditList({
                    searchKey: this.searchValue
                })
                .then(result => {
                    // set @track contacts variable with return contact list from server  
                    this.subRedditRecord = result;

                   /* Object.defineProperties(this.subRedditRecord, {
                        No_Of_Upvotes__c: {
                          writable: true,
                        },
                      });*/
                    console.log('*this.subRedditRecord*'+JSON.stringify(this.subRedditRecord));
                    /*this.subRedditRecord.forEach((element, index) => {
                        this.upvotesMap.set(index,element.No_Of_Upvotes__c);
                    });
                    console.log('*this.upvotesMap*'+JSON.stringify(this.upvotesMap));*/
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
                    this.subRedditRecord = null;
                });
        }
        if (this.searchValue == ''){
            this.searchempty=true;
        }
    }



    //UpVote and downVote logic starts here

   
    onClickVote(event){
        let recId = event.target.dataset.recordId;
        let recindex = event.currentTarget.dataset.index;
        console.log('index: '+recindex);
      //subRedditRecord
        let upvoteCount = this.subRedditRecord[recindex].No_Of_Upvotes__c;
        let downVotecount = this.subRedditRecord[recindex].No_Of_Downvotes__c;
        
    if(event.target.name === "UpLike"){
        console.log('before: '+this.subRedditRecord[recindex].No_Of_Upvotes__c);
        upvoteCount = this.subRedditRecord[recindex].No_Of_Upvotes__c + 1;
       try{
        this.subRedditRecord[recindex].No_Of_Upvotes__c =  this.subRedditRecord[recindex].No_Of_Upvotes__c + 1;
       }catch(err){
        console.log('catch error: '+err.message);
       }
        
        console.log('after: '+this.subRedditRecord[recindex].No_Of_Upvotes__c);
    }
    
    if(event.target.name === "DownLike"){
        downVotecount = this.subRedditRecord[recindex].No_Of_Downvotes__c + 1;
       try{
        this.subRedditRecord[recindex].No_Of_Downvotes__c =  this.subRedditRecord[recindex].No_Of_Downvotes__c + 1;
       }catch(err){
        console.log('catch error: '+err.message);
       }
        
        console.log('after: '+this.subRedditRecord[recindex].No_Of_Downvotes__c);
    }
    
    const fields ={};
  
    const recordInput = {
        fields: fields
    
        };

    fields[SUBREDDIT_ID_FIELD.fieldApiName]= recId;
    fields[SUBREDDIT_UPVOTES_FIELD.fieldApiName] =upvoteCount;
    fields[SUBREDDIT_DOWNVOTES_FIELD.fieldApiName] =downVotecount;

    
    updateRecord(recordInput)
    
    .then((data) => console.log('data update: '+JSON.stringify(data)))
    .catch((error) => console.log(error));
    
}

onClickVotedefault(event){
    let recId = event.target.dataset.recordId;
    let recindex = event.currentTarget.dataset.index;
    console.log('index: '+recindex);
  //subRedditRecord
    let upvoteCount = this.subRedditRecord2[recindex].No_Of_Upvotes__c;
    let downVotecount = this.subRedditRecord2[recindex].No_Of_Downvotes__c;
    
if(event.target.name === "UpLike"){
    console.log('before: '+this.subRedditRecord2[recindex].No_Of_Upvotes__c);
    upvoteCount = this.subRedditRecord2[recindex].No_Of_Upvotes__c + 1;
   try{
    this.subRedditRecord2[recindex].No_Of_Upvotes__c =  this.subRedditRecord2[recindex].No_Of_Upvotes__c + 1;
   }catch(err){
    console.log('catch error: '+err.message);
   }
    
    console.log('after: '+this.subRedditRecord2[recindex].No_Of_Upvotes__c);
}

if(event.target.name === "DownLike"){
    downVotecount = this.subRedditRecord2[recindex].No_Of_Downvotes__c + 1;
   try{
    this.subRedditRecord2[recindex].No_Of_Downvotes__c =  this.subRedditRecord2[recindex].No_Of_Downvotes__c + 1;
   }catch(err){
    console.log('catch error: '+err.message);
   }
    
    console.log('after: '+this.subRedditRecord2[recindex].No_Of_Downvotes__c);
}

const fields ={};

const recordInput = {
    fields: fields

    };

fields[SUBREDDIT_ID_FIELD.fieldApiName]= recId;
fields[SUBREDDIT_UPVOTES_FIELD.fieldApiName] =upvoteCount;
fields[SUBREDDIT_DOWNVOTES_FIELD.fieldApiName] =downVotecount;


updateRecord(recordInput)

.then((data) => console.log('data update: '+JSON.stringify(data)))
.catch((error) => console.log(error));

}
}