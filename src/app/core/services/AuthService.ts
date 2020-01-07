import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase';
import { User, AuthProvider, AuthOptions } from './auth.types';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  authState$: Observable<firebase.User>;
  constructor(private afAuth: AngularFireAuth) {
    this.authState$ = this.afAuth.authState;
  }

  authenticate({ isSignIn, provider, user }: AuthOptions): Promise<auth.UserCredential> {
    let operation: Promise<auth.UserCredential>;
    if (provider !== AuthProvider.Email) {
      operation = this.signWithPopUp(provider);
    } else {
      operation = isSignIn ? this.signInWithEmail(user) : this.signInWithEmail(user);
    }
    return operation;
  }

  get isAunthenticated(): Observable<Boolean> {
    return this.authState$.pipe(map(user => user !== null));
  }

  logout(): Promise<void> {
    return this.afAuth.auth.signOut();
  }

  private signInWithEmail({ email, password }: User): Promise<auth.UserCredential> {
    return this.afAuth.auth.signInWithEmailAndPassword(email, password);
  }

  private signUpWithEmail({ name, email, password }: User): Promise<auth.UserCredential> {
    return this.afAuth.auth
      .createUserWithEmailAndPassword(email, password)
      .then(credentials =>
        credentials.user
          .updateProfile({ displayName: name, photoURL: null })
          .then(() => credentials)
      );
  }
  private signWithPopUp(provider: AuthProvider): Promise<auth.UserCredential> {
    let signInProvider = null;
    switch (provider) {
      case AuthProvider.Facebook:
        signInProvider = new auth.FacebookAuthProvider();
        break;
    }
    return this.afAuth.auth.signInWithPopup(signInProvider);
  }
}
