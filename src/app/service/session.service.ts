
import { Injectable } from '@angular/core';

@Injectable()
export class SessionService {

  sessionId: string;
  sessionCheck: boolean;

  constructor() {

  }

  setSessionId(sid) {
    this.sessionId = sid;
  }

  getSessionId() {
    return this.sessionId;
  }

  setSessionCheck(sbool) {
    this.sessionCheck = sbool;
  }
  getSessionCheck() {
   return this.sessionCheck;
  }
}
