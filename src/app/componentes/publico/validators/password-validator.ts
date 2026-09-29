import { AbstractControl, ValidationErrors } from '@angular/forms';

export function PasswordValidator(form: AbstractControl): ValidationErrors | null {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
        return { passwordNoCoincide: true };
    }
    return null;
}