import { api, LightningElement, track, wire } from 'lwc';

import { getRecord, updateRecord } from "lightning/uiRecordApi";
import SUBREDDIT_OBJECT from "@salesforce/schema/SubReddit__c";
import SUBREDDIT_ID_FIELD from "@salesforce/schema/SubReddit__c.Id";
import SUBREDDIT_UPVOTES_FIELD from "@salesforce/schema/SubReddit__c.No_Of_Upvotes__c";
import SUBREDDIT_DOWNVOTES_FIELD from "@salesforce/schema/SubReddit__c.No_Of_Downvotes__c";
import getSubRedditList from '@salesforce/apex/subRedditController.subRedditSearchkey';
import { NavigationMixin } from 'lightning/navigation';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';

const getRecFields = [SUBREDDIT_UPVOTES_FIELD, SUBREDDIT_DOWNVOTES_FIELD ];

export default class SubReddit extends NavigationMixin(LightningElement)  {

    @track subRedditRecord;
    @track searchValue = '';
    @track upVote=0;
    @track downVote=0;
    @track recordidreal;

    renderedCallback() {
        if(this.isRendered) {
    let srid = this.template.querySelector("[data-id=srid]");
    console.log('srid :'+srid);
    }
}
    @track isModalOpen = false;
    openModal() {
        // to open modal set isModalOpen tarck value as true
        this.isModalOpen = true;
    }
    closeModal() {
        // to close modal set isModalOpen tarck value as false
        this.isModalOpen = false;
    }

    handleNoficationMore(event){        
        let rowId = event.target.dataset.recordId;
        console.log( "Record Id is "+ JSON.stringify( rowId ) );

        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: rowId,
                objectApiName: 'SubReddit__c', // objectApiName is optional
                actionName: 'view'
             }
         });
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
            getSubRedditList({
                    searchKey: this.searchValue
                })
                .then(result => {
                    // set @track contacts variable with return contact list from server  
                    this.subRedditRecord = result;
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
        } else {
            // fire toast event if input field is blank
            const event = new ShowToastEvent({
                variant: 'error',
                message: 'Search text missing..',
            });
            this.dispatchEvent(event);
        }
    }



    //UpVote and downVote logic starts here

   
    onClickVote(event){
        let recId = event.target.dataset.recordId;
        this.recordidreal = this.recId;

    if(event.target.name === "UpLike"){
            this.upVote= this.upVote+1;
    }
    if(event.target.name === "DownLike"){
        this.downVote = this.downVote+1 ;
    }
    
    const fields ={};
  
    const recordInput = {
        fields: fields
    
        };

    fields[SUBREDDIT_ID_FIELD.fieldApiName]= recId;
    fields[SUBREDDIT_UPVOTES_FIELD.fieldApiName] =this.upVote;
    fields[SUBREDDIT_DOWNVOTES_FIELD.fieldApiName] =this.downVote;

    
    updateRecord(recordInput)
    
    .then((data) => console.log(data))
    .catch((error) => console.log(error));
    
}

}