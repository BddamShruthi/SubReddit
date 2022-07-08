import { LightningElement ,track, api} from 'lwc';

import {updateRecord, createRecord } from "lightning/uiRecordApi";
import POST_ID_FIELD from "@salesforce/schema/Post__c.Id";
import POST_UPVOTES_FIELD from "@salesforce/schema/Post__c.No_Of_Upvotes__c";
import POST_DOWNVOTES_FIELD from "@salesforce/schema/Post__c.No_Of_Downvotes__c";
import getPostSearchkey from '@salesforce/apex/postController.postSearchkey';
import getPostDef from '@salesforce/apex/postController.getpostDefault';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import COMMENT_OBJECT from "@salesforce/schema/Comment__c";
import COMMENT_POST_FIELD from "@salesforce/schema/Comment__c.Post__c";
import COMMENT_BODY2_FIELD from "@salesforce/schema/Comment__c.Body2__c";
import { NavigationMixin } from 'lightning/navigation';

export default class PostPage extends NavigationMixin(LightningElement) {

@api redditid;
@api redditName;
@track accordianSection='';
@track postRecord;
@track postRecordsDefault;
@track isModalOpen = false;
@track upvotesPostMap = new Map();
@track downvotesPostMap = new Map();
@track PostSearchEmpty = true;
openModal() {
    // to open modal set isModalOpen tarck value as true
    this.isModalOpen = true;
}
closeModal() {
    // to close modal set isModalOpen tarck value as false
    this.isModalOpen = false;
}

handleSuccess( event ) {

    this.dispatchEvent(
        new ShowToastEvent( {
            title: 'Post Submission Result',
            message: 'Post Created Successfully',
            variant: 'success',
            mode: 'sticky'
        } )
    );
    this.isModalOpen = false;
}

handleSuccessComment(){
    this.dispatchEvent(
        new ShowToastEvent( {
            title: 'Comment Submission Result',
            message: 'Comment Submitted Successfully',
            variant: 'success',
            mode: 'sticky'
        } )
    );
    const inputFields = this.template.querySelectorAll( 'lightning-input-field[data-name="ResetPost"]' );
    if ( inputFields ) {
        inputFields.forEach( field => {
            field.reset();
        } );
    }
   // this.template.querySelector('lightning-input-field[data-name="Reset"]').value = null;
  }
 // update searchValue var when input field value change
 postSearchKeyword(event) {
    this.searchPostValue = event.target.value;
    if (this.searchPostValue !== '') {
        this.PostSearchEmpty = false;
        getPostSearchkey(data)({
            postSearchKey: this.searchPostValue,
            redditids: this.redditid
            })
            .then(result => {
                this.postRecord = result;
                console.log('*this.postRecord*'+JSON.stringify(this.postRecord));
                
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
                this.postRecord = null;
            });
    } 
    if (this.searchPostValue == ''){
        this.PostSearchEmpty=true;
    }
}


connectedCallback() {
    this.getData();
}

getData() {
    getPostDef({
        redditIdForDefault: this.redditid
})
.then(result => {
    this.postRecordsDefault = result;
})
.catch(error => {
    console.log('result :'+error);

    // const event = new ShowToastEvent({
    //     title: 'Error',
    //     variant: 'error',
    //     message: error.body.message,
    // });
    // this.dispatchEvent(event);
    // reset contacts var with null   
    this.postRecordsDefault = null;
});
}

//update likes and dislikes
onClickVote(event){
    let recId = event.target.dataset.recordId;
    let recindex = event.currentTarget.dataset.index;
    console.log('index: '+recindex);
  //postRecord
    let upvotesPostMap = this.postRecord[recindex].No_Of_Upvotes__c;
    let downvotesPostMap = this.postRecord[recindex].No_Of_Downvotes__c;
    
if(event.target.name === "UpLike"){
    console.log('before: '+this.postRecord[recindex].No_Of_Upvotes__c);
    upvotesPostMap = this.postRecord[recindex].No_Of_Upvotes__c + 1;
   try{
    this.postRecord[recindex].No_Of_Upvotes__c =  this.postRecord[recindex].No_Of_Upvotes__c + 1;
   }catch(err){
    console.log('catch error: '+err.message);
   }
    
    console.log('after: '+this.postRecord[recindex].No_Of_Upvotes__c);
}

if(event.target.name === "DownLike"){
    downvotesPostMap = this.postRecord[recindex].No_Of_Downvotes__c + 1;
   try{
    this.postRecord[recindex].No_Of_Downvotes__c =  this.postRecord[recindex].No_Of_Downvotes__c + 1;
   }catch(err){
    console.log('catch error: '+err.message);
   }
    
    console.log('after: '+this.postRecord[recindex].No_Of_Downvotes__c);
}

const fields ={};

const recordInput = {
    fields: fields

    };

fields[POST_ID_FIELD.fieldApiName]= recId;
fields[POST_UPVOTES_FIELD.fieldApiName] =upvotesPostMap;
fields[POST_DOWNVOTES_FIELD.fieldApiName] =downvotesPostMap;


updateRecord(recordInput)

.then((data) => console.log('data update: '+JSON.stringify(data)))
.catch((error) => console.log(error));

}

onClickVotedefault(event){
    let recId = event.target.dataset.recordId;
    let recindex = event.currentTarget.dataset.index;
    console.log('index: '+recindex);
  //postRecordsDefault
    let upvotesPostMap = this.postRecordsDefault[recindex].No_Of_Upvotes__c;
    let downvotesPostMap = this.postRecordsDefault[recindex].No_Of_Downvotes__c;
    
if(event.target.name === "UpLike"){
    console.log('before: '+this.postRecordsDefault[recindex].No_Of_Upvotes__c);
    upvotesPostMap = this.postRecordsDefault[recindex].No_Of_Upvotes__c + 1;
   try{
    this.postRecordsDefault[recindex].No_Of_Upvotes__c =  this.postRecordsDefault[recindex].No_Of_Upvotes__c + 1;
   }catch(err){
    console.log('catch error: '+err.message);
   }
    
    console.log('after: '+this.postRecordsDefault[recindex].No_Of_Upvotes__c);
}

if(event.target.name === "DownLike"){
    downvotesPostMap = this.postRecordsDefault[recindex].No_Of_Downvotes__c + 1;
   try{
    this.postRecordsDefault[recindex].No_Of_Downvotes__c =  this.postRecordsDefault[recindex].No_Of_Downvotes__c + 1;
   }catch(err){
    console.log('catch error: '+err.message);
   }
    
    console.log('after: '+this.postRecordsDefault[recindex].No_Of_Downvotes__c);
}

const fields ={};

const recordInput = {
    fields: fields
    };

    fields[POST_ID_FIELD.fieldApiName]= recId;
    fields[POST_UPVOTES_FIELD.fieldApiName] =upvotesPostMap;
    fields[POST_DOWNVOTES_FIELD.fieldApiName] =downvotesPostMap;


updateRecord(recordInput)

.then((data) => console.log('data update: '+JSON.stringify(data)))
.catch((error) => console.log(error));

}


commentProp;
commentHandleChange(event){

    if(event.target.name === "CommentBody"){
        this.commentProp = event.target.value;
}
}
saveComment2(event){
    let recId = event.target.dataset.recordId;
        const fields ={};
            
        fields[COMMENT_BODY2_FIELD.fieldApiName] =this.commentProp;
        fields[COMMENT_POST_FIELD.fieldApiName] =recId;
        console.log('recId :'+recId);
        console.log('commentProp :'+this.commentProp);

    const recordInput = {
        apiName: COMMENT_OBJECT.objectApiName,
        fields: fields
    
    };
    
    createRecord(recordInput)
    
    .then((data) => console.log(data))
    .catch((error) => console.log(error));
 

    this.dispatchEvent(
        new ShowToastEvent( {
            title: 'Comment Submission Result',
            message: 'Comment Saves Successfully',
            variant: 'success',
            mode: 'sticky'
        } )
    );
}

onclickViewComments(event){
    let postRecordId = event.target.dataset.recordId;
    let recindex = event.currentTarget.dataset.index;
    console.log('index: '+recindex);
  
    let postRecordName = this.postRecordsDefault[recindex].Name;

    console.log('postRecordName : '+postRecordName);
    console.log('postRecordId : '+postRecordId);

        this[NavigationMixin.Navigate]({
            type: "standard__component",
            attributes: {
                componentName: "c__navigateToComments"
            },
            state: {
                c__postid: postRecordId,
                c__postName: postRecordName
            }
        });
    }


    handleToggleSection(event) {
        if(this.accordianSection.length === 0){
          this.accordianSection =''
      }
      else{
          this.accordianSection ='comment'
      }

  }

}