
import { Injectable } from '@angular/core';

@Injectable()
export class SessionService {

  sessionId: string;
  currentPage: string;

  constructor() {

  }

  setSessionId(sid) {
    this.sessionId = sid;
  }

  getSessionId() {
    return this.sessionId;
  }

  setCurrentPage(s) {
    this.currentPage = s;
  }
  getCurrentPage() {
   return this.currentPage;
  }
}
