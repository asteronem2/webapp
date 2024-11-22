import { useState } from "react"
import { api_url } from '../config.jsx'
import axios from "axios"

const auth_api = api_url + 'auth/'

export default function Auth() {
    const [token, setToken] = useState('')

    const [help, setHelp] = useState(false)

    const [error, set_error] = useState(null)

    function textInput(event) {
        setToken(event.target.value)

        if(token != '') {
            set_error(null)
        }
    }

    async function clickButton() {
        const rres = token.search(/[^0-9a-zA-Z:]/);
                
        if(error !== null){
        }

        if(token == '') {
            set_error('Токен не должен быть пустым')
        } else if(token.length > 40) {
            set_error('Токен некорректный')
        } else if(token.length < 20) {
            set_error('Токен некорректный')
        } else if(rres != -1) {
            set_error('Токен некорректный')
        } else if(error !== null) {
            1+1
        } else {
            set_error(null)
        }

        if(error !== null) {
            return
        }
        
        const response = await axios.get(auth_api + 'check_token/?token=' + token, {withCredentials: true})
        console.log(response)
        const valid_token = response.data['valid_token']
        if(valid_token == false) {
            set_error('Токен некорректный')
            return
        } else {
            window.location.reload();
        }
    }

    return (
        <div className='auth'>
            <div className="tab" data-class="auth-tab">
                <h1 className="auth-text">Вход в аккаунт</h1>
                <div className="input-fields">
                    <p className="input-error">{error !== null && error}</p>
                    <input className="input-token" type="text" placeholder="Токен" onBlur={textInput} onKeyDown={clickButton}/>
                    <div className="token-info" id="token-info">
                        <p className="how-take-token" onClick={() => {setHelp(true)}}>Как получить токен для входа?</p>
                        {help == true && (
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