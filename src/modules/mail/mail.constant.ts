import User from "../user/entities/user.entity"

export interface MailOtp {
    email: string
    code: string
  }

  export interface MailInvite {
    emails: string[]
    sender: User
    url: string
  }
  
  export interface SendBatchEmails {
    accepted: string[]
    rejected: string[]
  }