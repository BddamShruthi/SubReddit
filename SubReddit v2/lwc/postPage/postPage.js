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
@track searchPostValue='';
@track accordianSection='';
@track postRecord=[];
@track postRecordsDefault=[];
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
  }

 postSearchKeyword(event) {
    this.searchPostValue = event.target.value;
    if (this.searchPostValue !== '') {
        this.PostSearchEmpty = false;
        getPostSearchkey({
            postSearchKey: this.searchPostValue,
            redditids: this.redditid
            })
            .then(result => {
                this.postRecord = result;
                console.log('*this.postRecord*'+JSON.stringify(this.postRecord));
                
            })
            .catch(error => {
                console.log('result :'+error); 
                this.postRecord = null;
            });
    } 
    if (this.searchPostValue == ''){
        this.PostSearchEmpty=true;
    }
}


  //Another way of doing Imperative apex
// async postSearchKeyword(event) {
//     this.searchPostValue = event.target.value;
//     if (this.searchPostValue !== '') {
//         this.postRecord = await getPostSearchkey({ postSearchKey: this.searchPostValue, redditids: this.redditid });
//         this.PostSearchEmpty=false;
//     }
//     if (this.searchPostValue == ''){
//         this.PostSearchEmpty=true;
//     }
// }


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

    this.postRecordsDefault = null;
});
this.dispatchEvent(new CustomEvent('recordChange'));
}

//update likes and dislikes
onClickVote(event){
    let recId = event.target.dataset.recordId;
    let recindex = event.currentTarget.dataset.index;
    console.log('index: '+recindex);

    let postRecordVote=[];
    if(this.postRecord == 0 ){
        postRecordVote = this.postRecordsDefault;
   }
    else {
        postRecordVote = this.postRecord;
   }
  //postRecord
    let upvotesPostMap = postRecordVote[recindex].No_Of_Upvotes__c;
    let downvotesPostMap = postRecordVote[recindex].No_Of_Downvotes__c;
    
if(event.target.name === "UpLike"){
    console.log('before: '+postRecordVote[recindex].No_Of_Upvotes__c);
    upvotesPostMap = postRecordVote[recindex].No_Of_Upvotes__c + 1;
   try{
    postRecordVote[recindex].No_Of_Upvotes__c =  postRecordVote[recindex].No_Of_Upvotes__c + 1;
   }catch(err){
    console.log('catch error: '+err.message);
   }
    
    console.log('after: '+postRecordVote[recindex].No_Of_Upvotes__c);
}

if(event.target.name === "DownLike"){
    downvotesPostMap = postRecordVote[recindex].No_Of_Downvotes__c + 1;
   try{
    postRecordVote[recindex].No_Of_Downvotes__c =  postRecordVote[recindex].No_Of_Downvotes__c + 1;
   }catch(err){
    console.log('catch error: '+err.message);
   }
    
    console.log('after: '+postRecordVote[recindex].No_Of_Downvotes__c);
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


onclickViewComments(event){
    let postRecordId = event.target.dataset.recordId;
    let recindex = event.currentTarget.dataset.index;
    let postRecordName;  

    if(this.postRecordsDefault!==''){
        postRecordName = this.postRecordsDefault[recindex].Name;
   }
    else if(this.postRecord ==''){
        postRecordName = this.postRecord[recindex].Name;
   }

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