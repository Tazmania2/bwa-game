/**
 * Shim de `process.env` para o alvo de TESTE.
 *
 * `src/environments/environment.ts` le `process.env[...]` em tempo de modulo.
 * No build isso funciona porque o alvo `build` usa
 * `@angular-builders/custom-webpack:browser` e o `DefinePlugin` de
 * `custom-webpack.config.ts` substitui `process.env` por um objeto literal.
 *
 * O alvo `test` usa o builder karma PADRAO, que nao carrega aquele webpack.
 * Resultado: `process` nunca existia no bundle de teste e a suite morria com
 * `ReferenceError: process is not defined` ao importar `environment.ts` —
 * antes de qualquer spec correr. Era a segunda barreira depois dos erros de
 * compilacao, e ficava escondida atras deles.
 *
 * Toda FLAG fica por definir de proposito: assim cai no default declarado em
 * `environment.ts` e o resultado dos testes nao depende do `.env` da maquina
 * de quem os corre. Se um spec precisar de uma flag ligada, que a defina no
 * proprio spec.
 *
 * A base da API e a excecao, e tem de ser: `readBackendUrlBaseFromProcessEnv`
 * devolve string vazia sem ela, e `game4u-api.service` recusa-se a montar
 * qualquer URL nesse estado ("defina backend_url_base"). No build isso nunca
 * acontece porque `custom-webpack.config.ts` tem um default embutido; aqui
 * declaramos o nosso.
 *
 * `.invalid` e TLD reservado (RFC 2606): nunca resolve. Se algum spec escapar
 * ao `HttpTestingController`, a chamada morre em DNS em vez de bater num
 * ambiente real — que e exatamente o que uma URL de producao aqui arriscaria.
 */
const globalRef = globalThis as typeof globalThis & {
  process?: { env: Record<string, string | undefined> };
};

globalRef.process = globalRef.process ?? {
  env: {
    G4U_API_BASE: 'https://api.test.invalid/api',
  },
};
