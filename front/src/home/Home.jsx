import axios from "axios"
import { useRef, useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, createPath } from 'react-router-dom';
import { api_url, send_cryptoaddress } from "../config"

const profile_logo = 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'
const bank_logo = 'M4 10v7h3v-7H4zm6 0v7h3v-7h-3zM2 22h19v-3H2v3zm14-12v7h3v-7h-3zm-4.5-9L2 6v2h19V6l-9.5-5z'
const crypto_logo = 'M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z'
const empty_avatar = 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'
const info_icon = 'M10 3a7 7 0 100 14 7 7 0 000-14zm-9 7a9 9 0 1118 0 9 9 0 01-18 0zm8-4a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zm.01 8a1 1 0 102 0V9a1 1 0 10-2 0v5z'


function Profile({user}) {
    if(!user) {return <div className="loading"></div>}
    const [enable_tooltip, set_enable_tooltip] = useState(false)
    const tooltipRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
          if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
            set_enable_tooltip(false); // Закрываем tooltip
          }
        };
        document.addEventListener("mousedown", handleClickOutside);

        // Удаляем обработчик при размонтировании
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [])

    return (
        <div className="profile">

            <div className="column1">
                <div className="avatar">
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="#666">
                        <path d={empty_avatar}/>
                    </svg>
                </div>
            </div>

            <div className="column2">
                <div className="name">
                    {user.first_name}
                </div>

                <div className="field email">
                    {user.email ? 'Почта: ' + user.emal : <p className="connect-email">Привязать почту</p>}
                </div>

                <div className="field telegram">
                    {user.tg_username ? 'Телеграм: @' + user.tg_username : 'Отсутсвует username'}
                </div>

                {user.email && (
                    <div className="field two-fa">
                        {user.two_fa == true ? '2FA включена' : <p className="enable-two-fa">Включить 2FA</p>}
                        
                        <svg 
                            className="info-icon" 
                            width='20'
                            height='20'
                            viewBox="0 0 20 20"
                            fill="#666" 
                            onClick={(e) => {
                                e.stopPropagation();
                                set_enable_tooltip((prev) => !prev);
                            }}  
                            >
                            <path d={info_icon}/>
                        </svg>
                        {enable_tooltip &&
                            <span ref={tooltipRef} className="tooltip">Двухфакторная аутентификация защищает, даже если ваш телеграм находится в руках злоумышленника.</span>
                        }
                    </div>
                )}


            </div>
        </div>
    )
}

function Exchange({user}) {
    if(!user) {return <div className="loading">Загрузка...</div>}
    const [step, set_step] = useState(1)
    const [value, set_value] = useState(null)
    const [bank, set_bank] = useState('sber')
    const [number, set_number] = useState(null)
    const [rates, set_rates] = useState(null)

    function click_next() {
        if(value && bank && number) {
            set_step(step + 1)
        }
        if(step == 2) {
            async function send_application_to_tg() {
                const response = await axios.post(api_url + 'application/create_application', {
                    value: value,
                    bank: bank,
                    number: number,
                })

                console.log(response.request)
            }
            send_application_to_tg()
        }
    }

    function save_to_clipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            alert('Скопировано')
        })
    }

    useEffect(() => {
        async function get_tether_and_rubles_rate() {
            const res = await axios.get('https://api.coincap.io/v2/assets/?ids=tether')
            const tether_rate = res.data.data[0]['priceUsd']
            const res2 = await axios.get('https://www.cbr-xml-daily.ru/daily_json.js')
            const rubles_rate = res2.data.Valute['USD']['Value']
            set_rates({
                'dollar_in_tether': parseFloat(tether_rate),
                'ruble_in_dollar': parseFloat(rubles_rate)
            })
        }
        get_tether_and_rubles_rate()
        }, []);

    return (
        <div className="exchange">
            <div className="first_step">
                <p className="title">Конвертация Tether (USDT)</p>
            </div>

            <div className="fields">
                { step == 1 &&
                     <>
                        <div className="input-value">
                            <p className="field-name">Сумма (USDT)</p>
                            <input type="text" placeholder="0" onChange={(event) => set_value(parseFloat(event.target.value))}/>
                        </div>

                        <div className="input-bank">
                            <p className="field-name">Банк</p>
                            <select type="text" placeholder="Сбер" onChange={(event) => set_bank(event.target.value)}>
                                <option value="sber">Сбер</option>
                                <option value="tbank">ТБанк (Тинькофф)</option>
                                <option value="alfa">Альфа</option>
                                <option value="vtb">ВТБ</option>
                                <option value="open">Открытие</option>
                            </select>
                        </div>

                        <div className="input-number">
                            <p className="field-name">Номер карты или телефона (если подключён СБП)</p>
                            <input type="text" placeholder="Номер" onChange={(event) => set_number(event.target.value)}/>
                        </div>

                        <button onClick={click_next}>
                            Далее
                        </button>
                    </>
                }
                { step == 2 &&
                    <>
                        <div className="value_info">
                            <p>Обмен <u>{value}</u> tether (USDT) в рубли</p>
                        </div>
                        <div className="value_info">
                            {rates ? (<p>В долларах: <u>{value * rates.dollar_in_tether}</u></p>) : (<div>Загрузка...</div>)}
                        </div>
                        <div className="value_info">
                            {rates ? (<p>В рублях: <u>{value * rates.dollar_in_tether * rates.ruble_in_dollar}</u></p>) : (<div>Загрузка...</div>)}
                        </div>

                        <div>
                            <p>У вас есть 30 минут на отправку USDT на данный адрес:<br /><span className="copy-address" onClick={(event) => save_to_clipboard(event.target.textContent)}>{send_cryptoaddress}</span></p>
                        </div>

                        <button onClick={click_next}>
                            Создать заявку
                        </button>
                    </>
                }
                { step == 3 && 
                    <>
                        <div>
                            <p>Ваша заявка обрабатывается (это может занять до 5 часов в рабочее время)</p>
                        </div>
                    </>
                }
            </div>
        </div>
    )
}

function Currencies() {
    const [currencies, set_currencies] = useState([])
    const [query, setQuery] = useState(''); // Для хранения запроса
    const [cryptoData, setCryptoData] = useState(null); // Для хранения данных криптовалюты
    const [error, setError] = useState(''); // Для хранения сообщения об ошибке
  

    const handleSearch = async (e) => {
        if (e.key === 'Enter') {
          try {
            const response = await axios.get('https://api.coincap.io/v2/assets/' + query.toLowerCase());
            console.log(response.data)
            setCryptoData({
                name: response.data.data['name'],
                priceUsd: response.data.data['priceUsd']
            });
            setError('');
            console.log(cryptoData)
        } catch (err) {
            setCryptoData(null);
            setError('Нет результатов');
        }
        }
      };
    
    useEffect(() => {
        async function get_currencies() {
            const response = await axios.get('https://api.coincap.io/v2/assets/?limit=24')
            console.log(response.data.data)
            set_currencies(response.data.data)
        }
        get_currencies()
    }, [])

    return (
        <div className="currencies">
            <input
                type='text'
                placeholder="Поиск"
                className="find"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleSearch}
            />
            {cryptoData && (
                <p className="dropdown">{cryptoData['name']} - {cryptoData['priceUsd']}$</p>
            )}
            {error && <p className="dropdown">{error}</p>}

            <div className="currency-tabs">
                {currencies.length === 0 ? <div className="loading"></div> :
                    currencies.map((curr) => (
                        <div className="currency-tab">
                            <p className="name">{curr['name']}</p>
                            <p className="price">{parseFloat(curr['priceUsd']).toFixed(5)}$</p>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

export default function Home({ id }) {
    const [activeLabel, setActiveLabel] = useState(""); // Стейт для отслеживания активной кнопки
    const navigate = useNavigate();
    const [user, set_user] = useState(null);

    function labelClick(label, path) {
        setActiveLabel(label); // Устанавливаем текущую активную кнопку
        navigate(path); // Выполняем навигацию
    }

    useEffect(() => {
        async function load_user() {
            const res = await axios.get(api_url + "user/get_user/?id=" + id);
            set_user(res.data);
        }
        load_user();
    }, [id]);

    useEffect(() => {
        const pathToLabelMap = {
            "/profile": "profile",
            "/exchange": "exchange",
            "/currencies": "currencies",
        };

        // Устанавливаем активную метку в зависимости от текущего маршрута
        const currentPath = location.pathname;
        setActiveLabel(pathToLabelMap[currentPath] || "profile"); // По умолчанию "profile"
    }, [location]);


    return (
        <div className="home">
            <div className="container">
                <div className="labels">
                    <button className={`label profile ${activeLabel === "profile" ? "active" : ""}`}
                            onClick={() => labelClick("profile", "/profile")}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d={profile_logo} />
                        </svg>
                        <span className="label-text">Профиль</span>
                    </button>

                    <button className={`label exchange ${activeLabel === "exchange" ? "active" : ""}`}
                            onClick={() => labelClick("exchange", "/exchange")}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d={bank_logo} />
                        </svg>
                        <span className="label-text">Обмен</span>
                    </button>
                    
                    <button className={`label currencies ${activeLabel === "currencies" ? "active" : ""}`}
                            onClick={() => labelClick("currencies", "/currencies")}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d={crypto_logo} />
                        </svg>
                        <span className="label-text">Валюты</span>
                    </button>
                </div>

                {!user ? <div className="loading"></div> :
                    <div className="tab">
                        <Routes>
                            <Route path="/profile" element={<Profile user={user} />} />
                            <Route path="/exchange" element={<Exchange user={user} />} />
                            <Route path="/currencies" element={<Currencies />} />
                        </Routes>
                    </div>
                }
            </div>
        </div>
    );
}
