export class User {
  constructor(public email: string,
              private mToken: string,
              readonly mTokenExpirationDate: Date,
              public id?: string) {
    if (id) {
      this.id = id;
    }
  }

  get token() {
    if (!this.mTokenExpirationDate || new Date() > this.mTokenExpirationDate) {
      return null;
    }
    return this.mToken;
  }
}
