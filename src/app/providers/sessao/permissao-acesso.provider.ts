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
        let user: Usuario | null = this.sessao.usuario;
        if (user) {
            return true;
        } else {
            return await this.sessao.init(true)
        }
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
