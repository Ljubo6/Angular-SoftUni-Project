import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {AuthService} from "../shared/services/auth.service";
import {Router} from "@angular/router";
import {Subscription} from "rxjs";
import {passwordMatch} from "../util"
import {MaterialService} from "../shared/classes/material.service";

@Component({
  selector: 'app-register-page',
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.css']
})
export class RegisterPageComponent implements OnInit, OnDestroy {
  form!: FormGroup
  aSub!: Subscription

  passwordControl = new FormControl(null, [Validators.required, Validators.minLength(6)])

  get passwordsGroup(): FormGroup{
    return this.form.controls['passwords'] as FormGroup
  }

  constructor(private auth: AuthService,
              private formBuilder: FormBuilder,
              private router: Router) {
  }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      email: new FormControl(null, [Validators.required, Validators.email]),
      passwords: new FormGroup({
        password: this.passwordControl,
        rePassword: new FormControl(null, [passwordMatch(this.passwordControl)])
      })
    })
  }

  ngOnDestroy() {
    if (this.aSub) {
      this.aSub.unsubscribe()
    }
  }


  onSubmit() {
    const {email,passwords} = this.form.value
    const body = {
      email,
      password: passwords.password
    }
    this.form.disable()
    this.aSub = this.auth.register(body).subscribe({
      next: () => {
        this.router.navigate(['/login'], {
          queryParams: {
            registered: true
          }
        })
      },
      error: error => {
        MaterialService.toast(error.error.message)
        this.form.enable()
      }
    })
  }

  shouldShowErrorControl(controlName: string, sourceGroup = this.form) {
    return sourceGroup.controls[controlName].touched && sourceGroup.controls[controlName].invalid
  }
}
