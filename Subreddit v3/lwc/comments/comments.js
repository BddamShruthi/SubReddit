import { LightningElement , api, track} from 'lwc';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import getCommentRecords from '@salesforce/apex/commentController.getCommentRecords';
import {updateRecord } from "lightning/uiRecordApi";
import COMMENT_ID_OBJECT from "@salesforce/schema/Comment__c.Id";
import COMMENT_UPVOTE_FIELD from "@salesforce/schema/Comment__c.Upvotes__c";
import COMMENT_DOWNVOTE_FIELD from "@salesforce/schema/Comment__c.DownVotes__c";
import VOTE_OBJECT from "@salesforce/schema/Vote__c";
import VOTE_SOURCEID_FIELD from "@salesforce/schema/Vote__c.Source_Id__c";
import VOTE_VOTECHECKBOX_FIELD from "@salesforce/schema/Vote__c.Vote__c";
import USER from '@salesforce/schema/Vote__c.User__c';
import VOTE_ID_FIELD from "@salesforce/schema/Vote__c.Id";
import Id from '@salesforce/user/Id';
export default class Comments extends LightningElement {

    @api postid;
    @api postName;
    @track userId=Id;
    @track CommentRecords=[];
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
        this.getData();
    }
    

    connectedCallback() {
        this.getData();
    }
    
    getData() {
        getCommentRecords({
            userId : this.userId,
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
            upvotesCommentMap = this.CommentRecords[recindex].parentComment.Upvotes__c + 1;
            if(this.CommentRecords[recindex].parentComment.DownVotes__c >0 ){
            downvotesCommentMap = this.CommentRecords[recindex].parentComment.DownVotes__c - 1;
            }
            if(this.CommentRecords[recindex].voterec != null && this.CommentRecords[recindex].voterec.Vote__c == true){
                this.CommentRecords[recindex].upLike = true;
                this.CommentRecords[recindex].downLike = false;
            }else if(this.CommentRecords[recindex].voterec != null && this.CommentRecords[recindex].voterec.Vote__c == false){
                this.CommentRecords[recindex].upLike = true;
                this.CommentRecords[recindex].downLike = false;
            }else{
                this.CommentRecords[recindex].upLike = true;
                this.CommentRecords[recindex].downLike = false;
            }
           
           try{
            this.CommentRecords[recindex].parentComment.Upvotes__c =  this.CommentRecords[recindex].parentComment.Upvotes__c + 1;
            if(this.CommentRecords[recindex].parentComment.DownVotes__c > 0 ){
            this.CommentRecords[recindex].parentComment.DownVotes__c =  this.CommentRecords[recindex].parentComment.DownVotes__c - 1;
            }
           }
           catch(err){
            console.log('catch error: '+err.message);
           }
        //  this.voteCreation(event);
        }
        if(event.target.name === "DownLike"){
            downvotesCommentMap = this.CommentRecords[recindex].parentComment.DownVotes__c + 1;
            if(this.CommentRecords[recindex].parentComment.Upvotes__c >0 ){
            upvotesCommentMap = this.CommentRecords[recindex].parentComment.Upvotes__c - 1;
            }
            if(this.CommentRecords[recindex].voterec != null && this.CommentRecords[recindex].voterec.Vote__c == false){
                this.CommentRecords[recindex].downLike = true;
                this.CommentRecords[recindex].upLike = false;
            }else if(this.CommentRecords[recindex].voterec != null && this.CommentRecords[recindex].voterec.Vote__c == true){
                this.CommentRecords[recindex].downLike = true;
                this.CommentRecords[recindex].upLike = false;
            }else{
                this.CommentRecords[recindex].upLike = false;
                this.CommentRecords[recindex].downLike = true;
            }
           
          
           try{
            this.CommentRecords[recindex].parentComment.DownVotes__c =  this.CommentRecords[recindex].parentComment.DownVotes__c + 1;
            if(this.CommentRecords[recindex].parentComment.Upvotes__c >0){
            this.CommentRecords[recindex].parentComment.Upvotes__c =  this.CommentRecords[recindex].parentComment.Upvotes__c - 1;
            }
           }catch(err){
            console.log('catch error: '+err.message);
           }
         //this.voteCreation(event);
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

    voteCreation(event){
        let recindex = event.target.dataset.index;
        if(this.CommentRecords[recindex].voterec == null){
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
            } 
        }
        else{
        const fields ={};
    
        const recordInput = {
            fields: fields
            };
        fields[VOTE_ID_FIELD.fieldApiName]= this.CommentRecords[recindex].voterec.Id;
        if(this.CommentRecords[recindex].voterec.Vote__c == true){
            fields[VOTE_VOTECHECKBOX_FIELD.fieldApiName] = false;
        } else if(this.CommentRecords[recindex].voterec.Vote__c == false){
            fields[VOTE_VOTECHECKBOX_FIELD.fieldApiName] = true;
        }
        updateRecord(recordInput)
        .then((data) => console.log(data))
        .catch((error) => console.log(error));
        }
    }

    onClickSubVote(event){
        let recId = event.target.dataset.recordId;
        let recindex = event.currentTarget.dataset.index;
        console.log('index: '+recindex);
      //CommentRecords
        let upvotesCommentMap = this.subCommentRecords[recindex].voterec.Upvotes__c;
        let downvotesCommentMap = this.subCommentRecords[recindex].voterec.DownVotes__c;
        
    if(event.target.name === "UpLikeSub"){
        console.log('before: '+this.subCommentRecords[recindex].voterec.Upvotes__c);
        upvotesCommentMap = this.subCommentRecords[recindex].voterec.Upvotes__c + 1;
       try{
        this.subCommentRecords[recindex].voterec.Upvotes__c =  this.subCommentRecords[recindex].voterec.Upvotes__c + 1;
       }catch(err){
        console.log('catch error: '+err.message);
       }
        
        console.log('after: '+this.subCommentRecords[recindex].voterec.Upvotes__c);
    }
    
    if(event.target.name === "DownLikeSub"){
        downvotesCommentMap = this.subCommentRecords[recindex].voterec.DownVotes__c + 1;
       try{
        this.subCommentRecords[recindex].voterec.DownVotes__c =  this.subCommentRecords[recindex].voterec.DownVotes__c + 1;
       }catch(err){
        console.log('catch error: '+err.message);
       }
        
        console.log('after: '+this.subCommentRecords[recindex].voterec.DownVotes__c);
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