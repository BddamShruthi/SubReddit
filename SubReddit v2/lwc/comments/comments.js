import { LightningElement , api, track} from 'lwc';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import getCommentRecords from '@salesforce/apex/commentController.getCommentRecords';
import {updateRecord } from "lightning/uiRecordApi";
import COMMENT_ID_OBJECT from "@salesforce/schema/Comment__c.Id";
import COMMENT_UPVOTE_FIELD from "@salesforce/schema/Comment__c.Upvotes__c";
import COMMENT_DOWNVOTE_FIELD from "@salesforce/schema/Comment__c.DownVotes__c";
export default class Comments extends LightningElement {

    @api postid;
    @api postName;
    @track CommentRecords;
    @track accordianSection = '';
    
    handleSuccessCommentPage(){
        this.dispatchEvent(
            new ShowToastEvent( {
                title: 'Comment Submission Result',
                message: 'Comment Submitted Successfully',
                variant: 'success',
                mode: 'sticky'
            } )
        );
        const inputFields = this.template.querySelectorAll('lightning-input-field[data-name="Reset"], lightning-input-field[data-name="Reset2"]');
        if ( inputFields ) {
            inputFields.forEach( field => {
                field.reset();
            } );
        }
    }
    

    connectedCallback() {
        this.getData();
    }
    
    getData() {
        getCommentRecords({
            postIdFromLwc: this.postid
    })
    .then(result => {
        this.CommentRecords = JSON.parse(JSON.stringify(result));
        console.log('Result ** '+(JSON.stringify(result)));
    })
    }

    handleToggleSection(event) {
        if(this.accordianSection.length === 0){
          this.accordianSection =''
      }
      else{
          this.accordianSection ='comment'
      }
  }

    onClickVote(event){
        let recId = event.target.dataset.recordId;
        let recindex = event.currentTarget.dataset.index;
        console.log('index: '+recindex);
      //CommentRecords
        let upvotesCommentMap = this.CommentRecords[recindex].parentComment.Upvotes__c;
        let downvotesCommentMap = this.CommentRecords[recindex].parentComment.DownVotes__c;
        
    if(event.target.name === "UpLike"){
        console.log('before: '+this.CommentRecords[recindex].parentComment.Upvotes__c);
        upvotesCommentMap = this.CommentRecords[recindex].parentComment.Upvotes__c + 1;
       try{
        this.CommentRecords[recindex].parentComment.Upvotes__c =  this.CommentRecords[recindex].parentComment.Upvotes__c + 1;
       }catch(err){
        console.log('catch error: '+err.message);
       }
        
        console.log('after: '+this.CommentRecords[recindex].parentComment.Upvotes__c);
    }
    
    if(event.target.name === "DownLike"){
        downvotesCommentMap = this.CommentRecords[recindex].parentComment.DownVotes__c + 1;
       try{
        this.CommentRecords[recindex].parentComment.DownVotes__c =  this.CommentRecords[recindex].parentComment.DownVotes__c + 1;
       }catch(err){
        console.log('catch error: '+err.message);
       }
        
        console.log('after: '+this.CommentRecords[recindex].parentComment.DownVotes__c);
    }
    
    const fields ={};
    
    const recordInput = {
        fields: fields
    
        };
    
    fields[COMMENT_ID_OBJECT.fieldApiName]= recId;
    fields[COMMENT_UPVOTE_FIELD.fieldApiName] =upvotesCommentMap;
    fields[COMMENT_DOWNVOTE_FIELD.fieldApiName] =downvotesCommentMap;
    
    
    updateRecord(recordInput)
    
    .then((data) => console.log('data update: '+JSON.stringify(data)))
    .catch((error) => console.log(error));
    
    }


    onClickSubVote(event){
        let recId = event.target.dataset.recordId;
        let recindex = event.currentTarget.dataset.index;
        console.log('index: '+recindex);
      //CommentRecords
        let upvotesCommentMap = this.subCommentRecords[recindex].Upvotes__c;
        let downvotesCommentMap = this.subCommentRecords[recindex].DownVotes__c;
        
    if(event.target.name === "UpLikeSub"){
        console.log('before: '+this.subCommentRecords[recindex].Upvotes__c);
        upvotesCommentMap = this.subCommentRecords[recindex].Upvotes__c + 1;
       try{
        this.subCommentRecords[recindex].Upvotes__c =  this.subCommentRecords[recindex].Upvotes__c + 1;
       }catch(err){
        console.log('catch error: '+err.message);
       }
        
        console.log('after: '+this.subCommentRecords[recindex].Upvotes__c);
    }
    
    if(event.target.name === "DownLikeSub"){
        downvotesCommentMap = this.subCommentRecords[recindex].DownVotes__c + 1;
       try{
        this.subCommentRecords[recindex].DownVotes__c =  this.subCommentRecords[recindex].DownVotes__c + 1;
       }catch(err){
        console.log('catch error: '+err.message);
       }
        
        console.log('after: '+this.subCommentRecords[recindex].DownVotes__c);
    }
    
    const fields ={};
    
    const recordInput = {
        fields: fields
    
        };
    
    fields[COMMENT_ID_OBJECT.fieldApiName]= recId;
    fields[COMMENT_UPVOTE_FIELD.fieldApiName] =upvotesCommentMap;
    fields[COMMENT_DOWNVOTE_FIELD.fieldApiName] =downvotesCommentMap;
    
    
    updateRecord(recordInput)
    
    .then((data) => console.log('data update: '+JSON.stringify(data)))
    .catch((error) => console.log(error));
    
    }
}