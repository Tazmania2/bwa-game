import {EnvironmentPlugin} from 'webpack';
import {config} from 'dotenv';

config()

module.exports = {
    plugins: [
        new EnvironmentPlugin({
            BACKEND_URL_BASE: "",
            CLIENT_ID: "",
            FUNIFIER_BASIC_TOKEN: "",
            FUNIFIER_BASE_URL: "",
            FUNIFIER_API_KEY: ""
        })
    ]
}
