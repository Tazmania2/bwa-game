import {inject, Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivateChildFn, Router, RouterStateSnapshot} from "@angular/router";
import {SessaoProvider} from "./sessao.provider";
import {Usuario} from "@model/usuario.model";

@Injectable({
    providedIn: 'root'
})
export class PermissaoAcessoProvider {

    constructor(private sessao: SessaoProvider, private router: Router) {
    }

    async validateSSOUser() {
        // Check if user is already logged in (has token and user data)
        let user: Usuario | null = this.sessao.usuario;
        let token = this.sessao.token;
        
        // If we have a user, they're authenticated
        if (user) {
            return true;
        }
        
        // If we have a token but no user, try to initialize
        // This happens when the page is refreshed
        if (token) {
            try {
                return await this.sessao.init(true);
            } catch (error) {
                console.error('Error initializing session:', error);
                return false;
            }
        }
        
        // No token, no user - not authenticated
        return false;
    }

    async validaTokenAcessoValido(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        const canActivate = await this.validateSSOUser()
        setTimeout(() => window.scrollTo(0, 0));

        if (canActivate)
            return true;
        else {
            await this.router.navigate(['login']);
            return false;
        }
    }
}

export const PermissaoAcessoGeral: CanActivateChildFn = async (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> => {
    return inject(PermissaoAcessoProvider).validaTokenAcessoValido(route, state);
}
