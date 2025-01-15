import { useState } from "react"
import { api_url, axiinstance } from './config.jsx'

const auth_api = api_url + 'auth/'

export default function Auth() {
    const [token, set_token] = useState('')

    const [help, setHelp] = useState(false)

    const [error, set_error] = useState(false)

    function input_token(event) {
        let value = event.target.value.replace(/ /g, '')

        if(/^[a-zA-Z0-9:]{0,38}$/.test(value)) {
            set_token(value)
        }
        check_token()
    }

    function check_token() {
        if(!/^[a-zA-Z0-9:]{24,38}$/.test(token)) {
            set_error(true)
        } else {
            set_error(false)
        }
    }

    async function clickButton(event) {
        check_token()
        if (event.key && event.key !== 'Enter') {
            return false
        }
        if (error === true) {
            return false
        }
        const response = await axiinstance.post('auth/check_token/', {
            token: token
        })

        const valid_token = response.data['valid_token']

        if(valid_token === false) {
            set_error(true)
        } else {
            window.location.reload();
        }
    }

    return (
        <div className='auth'>
            <div className="tab" data-class="auth-tab">
                <h1 className="auth-text">Вход в аккаунт</h1>
                <div className="input-fields">
                    <input
                        className={`input-token ${error === true && 'error-input'}`}
                        type="text"
                        placeholder="Токен"
                        value={token}
                        onChange={input_token}
                        onBlur={check_token}
                        onKeyDown={clickButton}/>
                    <div className="token-info" id="token-info">
                        <p
                            className="how-take-token"
                            onClick={() => {setHelp(true)}}
                        > Как получить токен для входа?</p>
                        {help === true && (
                            <p className="help"><a href="tg://t.me/aster_webapp_bot">Получите токен в боте</a></p>
                        )}
                    </div>
                </div>
                <button type="submit" className="auth-button" onClick={clickButton}>
                    Войти
                </button>
            </div>
        </div>
    )
}
