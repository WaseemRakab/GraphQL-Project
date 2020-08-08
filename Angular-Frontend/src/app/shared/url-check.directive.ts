import {FormGroup, ValidationErrors, ValidatorFn, Validators} from '@angular/forms';

export const invalidImage: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
  const option = control.get('uploadOption').value;
  if (option === 'Upload') {
    return null;
  }
  const validatedUrl = Validators.pattern(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&/=]*)/);
  const errors = validatedUrl(control.get('image'));
  if (errors !== null) {
    return {validImage: true};
  }
  return null;
};
