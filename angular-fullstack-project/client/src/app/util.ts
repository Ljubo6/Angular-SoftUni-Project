import {AbstractControl, ValidatorFn} from "@angular/forms";

export function passwordMatch(passwordFormControl: AbstractControl){
  const validatorFn: ValidatorFn = (rePasswordFormControl: AbstractControl) => {
    if (passwordFormControl.value !== rePasswordFormControl.value){
      return {
        passwordMissmatch: true
      }
    }
    return null
  }
  return validatorFn
}
