import {useEffect, useRef, useState} from "react";
import {axiinstance} from "./config.jsx";
import {Routes, Route, Navigate, useNavigate, useLocation} from "react-router-dom";
import {floatToStr} from "./utils.jsx";
import ChoiceModal from "./components.jsx";

const banks = {
    'tbank': 'ТБанк (Тинькофф)',
    'sber': 'Сбер',
    'alfa': 'Альфа'
}
const statuses = {
    'completed': 'Выполненная',
    'waiting': 'Ожидание',
    'reject': 'Отменённая',
    'correction': "Коррекция"
}

const fullscreenEnterSvg = 'M18.5,5.5 L16,5.5 C15.1716,5.5 14.5,4.82843 14.5,4 C14.5,3.17157 15.1716,2.5 16,2.5 L19,2.5 C20.3807,2.5 21.5,3.61929 21.5,5 L21.5,8 C21.5,8.82843 20.8284,9.5 20,9.5 C19.1716,9.5 18.5,8.82843 18.5,8 L18.5,5.5 Z M8,5.5 L5.5,5.5 L5.5,8 C5.5,8.82843 4.82843,9.5 4,9.5 C3.17157,9.5 2.5,8.82843 2.5,8 L2.5,5 C2.5,3.61929 3.61929,2.5 5,2.5 L8,2.5 C8.82843,2.5 9.5,3.17157 9.5,4 C9.5,4.82843 8.82843,5.5 8,5.5 Z M8,18.5 L5.5,18.5 L5.5,16 C5.5,15.1716 4.82843,14.5 4,14.5 C3.17157,14.5 2.5,15.1716 2.5,16 L2.5,19 C2.5,20.3807 3.61929,21.5 5,21.5 L8,21.5 C8.82843,21.5 9.5,20.8284 9.5,20 C9.5,19.1716 8.82843,18.5 8,18.5 Z M16,18.5 L18.5,18.5 L18.5,16 C18.5,15.1716 19.1716,14.5 20,14.5 C20.8284,14.5 21.5,15.1716 21.5,16 L21.5,19 C21.5,20.3807 20.3807,21.5 19,21.5 L16,21.5 C15.1716,21.5 14.5,20.8284 14.5,20 C14.5,19.1716 15.1716,18.5 16,18.5 Z'
const fullscreenExitSvg = 'M17.5,6.5 L20,6.5 C20.8284,6.5 21.5,7.17157 21.5,8 C21.5,8.82843 20.8284,9.5 20,9.5 L17,9.5 C15.6193,9.5 14.5,8.38071 14.5,7 L14.5,4 C14.5,3.17157 15.1716,2.5 16,2.5 C16.8284,2.5 17.5,3.17157 17.5,4 L17.5,6.5 Z M4,6.5 L6.5,6.5 L6.5,4 C6.5,3.17157 7.17157,2.5 8,2.5 C8.82843,2.5 9.5,3.17157 9.5,4 L9.5,7 C9.5,8.38071 8.38071,9.5 7,9.5 L4,9.5 C3.17157,9.5 2.5,8.82843 2.5,8 C2.5,7.17157 3.17157,6.5 4,6.5 Z M4,17.5 L6.5,17.5 L6.5,20 C6.5,20.8284 7.17157,21.5 8,21.5 C8.82843,21.5 9.5,20.8284 9.5,20 L9.5,17 C9.5,15.6193 8.38071,14.5 7,14.5 L4,14.5 C3.17157,14.5 2.5,15.1716 2.5,16 C2.5,16.8284 3.17157,17.5 4,17.5 Z M20,17.5 L17.5,17.5 L17.5,20 C17.5,20.8284 16.8284,21.5 16,21.5 C15.1716,21.5 14.5,20.8284 14.5,20 L14.5,17 C14.5,15.6193 15.6193,14.5 17,14.5 L20,14.5 C20.8284,14.5 21.5,15.1716 21.5,16 C21.5,16.8284 20.8284,17.5 20,17.5 Z'
const arrowRightSvg = "M11.0731 18.8389C10.2649 19.5461 9 18.9721 9 17.8982L9 6.10192C9 5.02797 10.2649 4.454 11.0731 5.1612L17.3838 10.683C18.1806 11.3802 18.1806 12.6198 17.3838 13.317L11.0731 18.8389ZM10.5 17.3472L16.396 12.1882C16.5099 12.0886 16.5099 11.9115 16.396 11.8119L10.5 6.65286L10.5 17.3472Z"
const arrowLeftSvg = "M12.9269 18.8389C13.7351 19.5461 15 18.9721 15 17.8982L15 6.10192C15 5.02797 13.7351 4.454 12.9269 5.1612L6.61619 10.683C5.8194 11.3802 5.8194 12.6198 6.61619 13.317L12.9269 18.8389ZM13.5 17.3472L7.60402 12.1882C7.4901 12.0886 7.4901 11.9115 7.60402 11.8119L13.5 6.65286L13.5 17.3472Z";

let notificationTimer

function Auth() {
    const [token, setToken] = useState('');
    const [tokenError, setTokenError] = useState(false);
    function changeToken (event) {
        setToken(event.target.value)
        setTokenError(false);
    }
    async function checkToken() {
        const response = await axiinstance.post('/admin/auth/', {token: token})
        if (response.data.access === true) {
            window.location.reload();
        } else (
            setTokenError(true)
        )
    }
    return (
        <div className='auth'>
            <div className='tab'>
                <h2>Вход в админ панель</h2>
                <input type="text" placeholder='Токен' value={token} onChange={changeToken} className={tokenError ? 'error-input' : ''}/>
                <button onClick={checkToken}>Войти</button>
            </div>
        </div>
    )
}

function Stats() {
    return (
        <div className='stats'>
            <div className='info-list'>
                <div className='info'>
                    <p className='title'>Сумма выплат</p>
                    <p className='value'>0</p>
                </div>
                <div className='info'>
                    <p className='title'>Сумма комиссий</p>
                    <p className='value'>0</p>
                </div>
                <div className='info'>
                    <p className='title'>Заявки в ожидании</p>
                    <p className='value'>0</p>
                </div>
                <div className='info'>
                    <p className='title'>Выполненные заявки</p>
                    <p className='value'>0</p>
                </div>
            </div>
        </div>
    )
}

function Withdraws() {
    const [activeModal, setActiveModal] = useState(null); // 'null' - нет активного модала
    const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 }); // Позиция модала

    const [withdraws, setWithdraws] = useState([]);
    const [filteredWithdraws, setFilteredWithdraws] = useState([]);
    const [sortConfig, setSortConfig] = useState({field: 'datetime', direction: 'desc', name: 'Новые'})
    const [filterConfig, setFilterConfig] = useState({
        banks: [...Object.keys(banks)],
        statuses: [...Object.keys(statuses)],
    })
    const [inputTagId, setInputTagId] = useState(null)

    const inputRef = useRef(null)

    const withdrawsRef = useRef(null)
    const [isFullscreen, setIsFullscreen] = useState(false);
    const toggleFullscreen = () => {
        if (!isFullscreen) {
            // Включаем полноэкранный режим
            withdrawsRef.current.requestFullscreen?.()
                .then(() => setIsFullscreen(true))
                .catch(err => console.error("Ошибка при попытке включить полноэкранный режим:", err));
        } else {
            // Выключаем полноэкранный режим
            document.exitFullscreen?.()
                .then(() => setIsFullscreen(false))
                .catch(err => console.error("Ошибка при попытке выйти из полноэкранного режима:", err));
        }
    };
    const handleFullscreenChange = () => {
        const fullscreenElement = document.fullscreenElement;
        setIsFullscreen(fullscreenElement === withdrawsRef.current);
    };



    const notificationRef = useRef(null);
    const [notificationText, setNotificationText] = useState('');

    const [tooltipText, setTooltipText] = useState('');
    const [tooltipPosition, setTooltipPosition] = useState({ left: 0, top: 0 });

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(50);
    const [totalPages, setTotalPages] = useState(null);
    const [totalAmount, setTotalAmount] = useState(0);
    const [pageAmount, setPageAmount] = useState(0);

    const [search, setSearch] = useState('');

    const toggleBank = (bank) => {
        setFilterConfig((prev) => ({
            ...prev,
            banks: prev.banks.includes(bank)
                ? (prev.banks.length > 1 ? prev.banks.filter((b) => b !== bank) : [...prev.banks])
                : [...prev.banks, bank],
        }));
    };

    const toggleStatus = (status) => {
        setFilterConfig((prev) => ({
            ...prev,
            statuses: prev.statuses.includes(status)
                ? (prev.statuses.length > 1 ? prev.statuses.filter((s) => s !== status) : [...prev.statuses])
                : [...prev.statuses, status],
        }));
    };

    function callNotification(text, seconds = 3) {
        setNotificationText(text);

        if (notificationRef.current) {
            notificationRef.current.show();

            // Если есть уже активный таймер, отменяем его
            if (notificationTimer) {
                clearTimeout(notificationTimer);
            }

            // Устанавливаем новый таймер
            notificationTimer = setTimeout(() => {
                // Добавляем класс для плавного исчезновения
                notificationRef.current.classList.add('fade-out');
                setTimeout(() => {
                    notificationRef.current.close();
                    setNotificationText('');
                    // Убираем класс после закрытия
                    notificationRef.current.classList.remove('fade-out');
                }, 1000); // Время совпадает с длительностью анимации
            }, (seconds - 1) * 1000); // Учёт последней секунды для анимации
        }
    }

    function handleBankClick(event) {
        const buttonRect = event.target.getBoundingClientRect();

        setModalPosition({
            top: buttonRect.bottom + window.scrollY + 5,
            left: buttonRect.left + window.scrollX,
        });

        setActiveModal(!activeModal ? "bankModal": null); // Открываем модал для выбора банков
    }

    function handleStatusClick(event) {
        const buttonRect = event.target.getBoundingClientRect();

        setModalPosition({
            top: buttonRect.bottom + window.scrollY + 5,
            left: buttonRect.left + window.scrollX,
        });

        setActiveModal(!activeModal ? "statusModal": null); // Открываем модал для выбора статуса
    }

    function sortArrow(field) {
        if (field === sortConfig.field) {
            return sortConfig.direction === 'asc' ? ' ↓' : ' ↑';
        }
        return ''
    }

    async function save_tag(id, tag) {
        try {
            await axiinstance.patch('/admin/withdraw/update_tag/', {tag: tag, id: id})
            setWithdraws(withdraws.map(item =>
                    item.id === id
                        ? { ...item, tag: tag }
                        : item
                )
            )
        } catch (error) {
            console.log(error)
        }
    }

    function savePhone(id) {
        const foundItem = filteredWithdraws.find(item => item.id === id);
        const htmlToSave = `<strong>${banks[foundItem.bank]}</strong><br>${foundItem.phone}<br>${foundItem.receiver || 'Пусто'}<br>${foundItem.amount}`;
        const plainTextToSave = `${banks[foundItem.bank]}\n${foundItem.phone}\n${foundItem.receiver || 'Пусто'}\n${foundItem.amount}`;

        const clipboardItem = new ClipboardItem({
            'text/html': new Blob([htmlToSave], { type: 'text/html' }),
            'text/plain': new Blob([plainTextToSave], { type: 'text/plain' }),
        });

        navigator.clipboard.write([clipboardItem])

        callNotification("Скопировано")
    }

    function saveCard(id) {
        const foundItem = filteredWithdraws.find(item => item.id === id);
        const htmlToSave = `<strong>${banks[foundItem.bank]}</strong><br>${foundItem.card}<br>${foundItem.receiver || 'Пусто'}<br>${foundItem.amount}`;
        const plainTextToSave = `${banks[foundItem.bank]}\n${foundItem.card}\n${foundItem.receiver || 'Пусто'}\n${foundItem.amount}`;

        const clipboardItem = new ClipboardItem({
            'text/html': new Blob([htmlToSave], { type: 'text/html' }),
            'text/plain': new Blob([plainTextToSave], { type: 'text/plain' }),
        });

        navigator.clipboard.write([clipboardItem])

        callNotification("Скопировано")

    }

    async function sendDocument(event) {
        const withdrawId = event.target.dataset.key
        const file = event.target.files[0];

        if (!file) {
            console.log("Нет выбранного файла");
            return
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            // Отправка файла на сервер
            const response = await axiinstance.post("/admin/withdraw/upload_document/" + withdrawId + "/", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            console.log("Файл загружен успешно:", response.data);
        } catch (error) {
            console.error("Ошибка при загрузке файла:", error);
        }



    }


    useEffect(() => {
        // Асинхронная функция для получения данных
        async function getWithdraws() {
            try {
                const response = await axiinstance.get('/admin/withdraws/', {
                    params: {
                        page: currentPage,
                        limit: itemsPerPage,
                        statuses: filterConfig.statuses,
                        banks: filterConfig.banks,
                        sort_by: sortConfig.field,
                        order: sortConfig.direction,
                        ...(search.trim() ? { search: search } : {}),
                    },
                });

                if (response.data) {
                    return response.data;
                } else {
                    return [];
                }
            } catch (error) {
                console.error("Error fetching withdraws:", error);
                return [];
            }
        }

        // Основная логика получения и обработки данных
        async function fetchData() {
            const data = await getWithdraws();
            setTotalPages(data.meta.total_pages)
            setTotalAmount(data.meta.total_amount)
            setPageAmount(data.meta.page_amount)
            const withdraws = data.withdraws;
            //
            // const boldText = (text, offset, length) => {
            //     let updatedText = text.slice(0, offset + length) + "</span>" + text.slice(offset + length);
            //     updatedText = updatedText.slice(0, offset) + "<span style={{fontWeight: 'bold'}}'>" + updatedText.slice(offset);
            //     return updatedText;
            // };
            //
            const formattedWithdraws = withdraws
                .map((withdraw) => {
                    return {
                        ...withdraw,
                        datetime: new Date(withdraw.datetime).toLocaleString('ru-RU', {
                            hour12: false,
                        }).replace(/,/g, ''),
                        amount: floatToStr(parseFloat(withdraw.amount)),
                        amount_in_usd: floatToStr(parseFloat(withdraw.amount_in_usd.toFixed(2)))
                    }
                    // baseFormatted.searched?.forEach((dict) => {
                    //     const field = dict.field;
                    //     const offset = dict.offset;
                    //     const length = dict.length;
                    //     const value = baseFormatted[field].toString();
                    //     console.log(dict);
                    //     console.log(baseFormatted[field]);
                    //     console.log(value)
                    //     if (value) {
                    //         baseFormatted[field] = boldText(value, offset, length);
                    //     }
                    // });

                });

            setFilteredWithdraws(formattedWithdraws);
        }

        fetchData();
    }, [sortConfig, filterConfig, currentPage, itemsPerPage, search]);

    useEffect(() => {
        setCurrentPage(1)
    }, [sortConfig, filterConfig, itemsPerPage, search]);
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, [inputTagId]);

    useEffect(() => {
        const handleMouseMove = (e) => {
            setTooltipPosition({ left: e.pageX + 10, top: e.pageY + 10 });
        };

        // Добавляем обработчик события mousemove
        window.addEventListener('mousemove', handleMouseMove);

        // Убираем обработчик при размонтировании компонента
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [tooltipText]);

    useEffect(() => {
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => {
            // Удаляем слушатель при размонтировании компонента
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
        };
    }, [])

    return (
        <>
            {tooltipText &&
                <div className="tooltip" style={{top: tooltipPosition.top, left: tooltipPosition.left}}>
                    {tooltipText}
                </div>
            }
            <dialog ref={notificationRef} className='notification'>
                {notificationText}
            </dialog>
            <div className={`withdraws ${isFullscreen ? 'fullscreen' : ''}`} ref={withdrawsRef}>
                <ChoiceModal
                    isVisible={activeModal === "bankModal"} // Показываем модал, если активен "bankModal"
                    position={modalPosition}
                    options={banks}
                    selectedOptions={filterConfig.banks}
                    onToggleOption={toggleBank}
                    onClose={() => setActiveModal(null)} // Закрытие модала, сброс состояния
                />
                <ChoiceModal
                    isVisible={activeModal === "statusModal"} // Показываем модал, если активен "bankModal"
                    position={modalPosition}
                    options={statuses}
                    selectedOptions={filterConfig.statuses}
                    onToggleOption={toggleStatus}
                    onClose={() => setActiveModal(null)} // Закрытие модала, сброс состояния
                />
                <div className='top'>
                    <input type="text" placeholder='Поиск' className='search-input' value={search}
                           onChange={(e) => setSearch(e.target.value)}/>
                    <p>Общая сумма:<br/>{floatToStr(totalAmount)} $</p>
                    <p>Сумма страницы:<br/>{floatToStr(pageAmount)} $</p>
                    <div className="only-waiting">
                        <input type="checkbox" onClick={() => {
                            console.log(filterConfig.statuses);
                            setFilterConfig({
                                ...filterConfig,
                                statuses: (filterConfig.statuses.length === 1 && filterConfig.statuses[0] === "waiting")
                                    ? Object.keys(statuses)
                                    : ["waiting"]
                            });
                            console.log(filterConfig.statuses);
                        }}/>
                        <p>Ожидание</p>
                    </div>
                    <svg className='fullscreen-button' xmlns='http://www.w3.org/2000/svg' width='24' height='24'
                         viewBox='0 0 24 24' fill='currentColor' onClick={() => {
                        // setIsFullscreen(!isFullscreen)
                        toggleFullscreen();
                    }}>
                        <path d={isFullscreen ? fullscreenExitSvg : fullscreenEnterSvg} fill='#64748b'/>
                    </svg>
                </div>
                <div className='table'>
                    <table>
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th
                                onClick={() => {
                                    if (sortConfig.field === 'datetime') {
                                        if (sortConfig.direction === 'asc') {
                                            setSortConfig({field: 'datetime', direction: 'desc', name: 'Новые'})
                                        } else {
                                            setSortConfig({field: 'datetime', direction: 'asc', name: 'Старые'})
                                        }
                                    } else {
                                        setSortConfig({field: 'datetime', direction: 'desc', name: 'Новые'})
                                    }
                                }}
                            >Дата{sortArrow('datetime')}</th>
                            {!isFullscreen && <th>Пользователь</th>}
                            <th>Телефон</th>
                            <th>Карта</th>
                            <th>Получатель</th>
                            <th onClick={handleBankClick}
                            >Банк</th>
                            <th
                                onClick={() => {
                                    if (sortConfig.field === 'amount') {
                                        if (sortConfig.direction === 'asc') {
                                            setSortConfig({field: 'amount', direction: 'desc', name: 'Сумма больше'})
                                        } else {
                                            setSortConfig({field: 'amount', direction: 'asc', name: 'Сумма меньше'})
                                        }
                                    } else {
                                        setSortConfig({field: 'amount', direction: 'desc', name: 'Сумма больше'})
                                    }
                                }}
                            >Сумма{sortArrow('amount')}</th>
                            <th>Метка</th>
                            <th onClick={handleStatusClick}
                                title={`${filterConfig.statuses.length === 1 ? statuses[filterConfig.statuses[0]] : 'Все'}`}
                            >Статус</th>
                            <th>Документ</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredWithdraws.length > 0 &&
                            filteredWithdraws.map((i) => (
                                <tr key={i.id}>
                                    <td>{i.id}</td>
                                    <td>{i.datetime}</td>
                                    {!isFullscreen && <td>{i.user}</td>}
                                    <td><span className="text-to-click" onClick={() => savePhone(i.id)}>{i.phone}</span>
                                    </td>
                                    <td><span className="text-to-click" onClick={() => saveCard(i.id)}>{i.card}</span>
                                    </td>
                                    <td>{i.receiver}</td>
                                    <td>{banks[i.bank]} {
                                        i.comment &&
                                        <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'
                                             viewBox='0 0 20 20' fill='red'
                                             onMouseEnter={() => setTooltipText(i.comment)}
                                             onMouseLeave={() => setTooltipText("")}>
                                            <path
                                                d="M9.0001 8.517C8.58589 8.517 8.2501 8.85279 8.2501 9.267C8.2501 9.68121 8.58589 10.017 9.0001 10.017V8.517ZM16.0001 10.017C16.4143 10.017 16.7501 9.68121 16.7501 9.267C16.7501 8.85279 16.4143 8.517 16.0001 8.517V10.017ZM9.8751 11.076C9.46089 11.076 9.1251 11.4118 9.1251 11.826C9.1251 12.2402 9.46089 12.576 9.8751 12.576V11.076ZM15.1251 12.576C15.5393 12.576 15.8751 12.2402 15.8751 11.826C15.8751 11.4118 15.5393 11.076 15.1251 11.076V12.576ZM9.1631 5V4.24998L9.15763 4.25002L9.1631 5ZM15.8381 5L15.8438 4.25H15.8381V5ZM19.5001 8.717L18.7501 8.71149V8.717H19.5001ZM19.5001 13.23H18.7501L18.7501 13.2355L19.5001 13.23ZM18.4384 15.8472L17.9042 15.3207L17.9042 15.3207L18.4384 15.8472ZM15.8371 16.947V17.697L15.8426 17.697L15.8371 16.947ZM9.1631 16.947V16.197C9.03469 16.197 8.90843 16.23 8.79641 16.2928L9.1631 16.947ZM5.5001 19H4.7501C4.7501 19.2662 4.89125 19.5125 5.12097 19.6471C5.35068 19.7817 5.63454 19.7844 5.86679 19.6542L5.5001 19ZM5.5001 8.717H6.25012L6.25008 8.71149L5.5001 8.717ZM6.56175 6.09984L6.02756 5.5734H6.02756L6.56175 6.09984ZM9.0001 10.017H16.0001V8.517H9.0001V10.017ZM9.8751 12.576H15.1251V11.076H9.8751V12.576ZM9.1631 5.75H15.8381V4.25H9.1631V5.75ZM15.8324 5.74998C17.4559 5.76225 18.762 7.08806 18.7501 8.71149L20.2501 8.72251C20.2681 6.2708 18.2955 4.26856 15.8438 4.25002L15.8324 5.74998ZM18.7501 8.717V13.23H20.2501V8.717H18.7501ZM18.7501 13.2355C18.7558 14.0153 18.4516 14.7653 17.9042 15.3207L18.9726 16.3736C19.7992 15.5348 20.2587 14.4021 20.2501 13.2245L18.7501 13.2355ZM17.9042 15.3207C17.3569 15.8761 16.6114 16.1913 15.8316 16.197L15.8426 17.697C17.0201 17.6884 18.1461 17.2124 18.9726 16.3736L17.9042 15.3207ZM15.8371 16.197H9.1631V17.697H15.8371V16.197ZM8.79641 16.2928L5.13341 18.3458L5.86679 19.6542L9.52979 17.6012L8.79641 16.2928ZM6.2501 19V8.717H4.7501V19H6.2501ZM6.25008 8.71149C6.24435 7.93175 6.54862 7.18167 7.09595 6.62627L6.02756 5.5734C5.20098 6.41216 4.74147 7.54494 4.75012 8.72251L6.25008 8.71149ZM7.09595 6.62627C7.64328 6.07088 8.38882 5.75566 9.16857 5.74998L9.15763 4.25002C7.98006 4.2586 6.85413 4.73464 6.02756 5.5734L7.09595 6.62627Z"></path>
                                        </svg>
                                    }</td>
                                    <td>{i.amount}</td>
                                    <td onClick={() => {
                                        setInputTagId(inputTagId === i.id ? null : i.id)
                                    }}>
                                        {inputTagId !== i.id ?
                                            (<span>{i.tag}</span>)
                                            :
                                            (<input type="text" className='input-in-table' ref={inputRef}
                                                    onKeyUp={(event) => {
                                                        if (event.key === 'Enter' && event.target.value !== "") {
                                                            save_tag(i.id, event.target.value);
                                                        }
                                                        if (event.key === "Enter" || event.key === "Escape") {
                                                            setInputTagId(null);
                                                        }
                                                    }}/>)}
                                    </td>
                                    <td className={i.status}><span>{statuses[i.status]}</span></td>
                                    <td>
                                        {i.document ?
                                            <span className="text-to-click"></span>
                                            :
                                            <>
                                                <input
                                                    data-key={i.id}
                                                    type="file"
                                                    style={{display: 'none'}}
                                                    id={`input-document-${i.id}`}
                                                    accept="image/png, image/jpeg, application/pdf"
                                                    onInput={sendDocument}
                                                />
                                                <label htmlFor={`input-document-${i.id}`} className="text-to-click" >Загрузить</label>
                                            </>
                                        }
                                        
                                    </td>
                                </tr>
                            ))
                        }
                        </tbody>
                    </table>
                </div>
                {totalPages !== 0 &&
                    <>
                        <div className="pagination">
                            <select value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))}>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                                <option value={200}>200</option>
                            </select>

                            <div className="pagination-buttons">
                                {/* Левая стрелка */}
                                <svg
                                    onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                                    style={{
                                        cursor: currentPage > 1 ? "pointer" : "default",
                                        opacity: currentPage > 1 ? 1 : 0.5
                                    }}
                                >
                                    <path d={arrowLeftSvg}></path>
                                </svg>

                                {(() => {
                                    const totalButtons = 11; // Всего кнопок, включая активную
                                    let startPage = currentPage - 5; // Стартовая страница для отображения
                                    let endPage = currentPage + 5; // Конечная страница для отображения

                                    // Если общее количество страниц меньше totalButtons, корректируем startPage и endPage
                                    if (totalPages < totalButtons) {
                                        startPage = 1;
                                        endPage = totalPages;
                                    } else {
                                        // Если активная страница близка к началу, сдвигаем диапазон влево
                                        if (currentPage <= 5) {
                                            startPage = 1;
                                            endPage = totalButtons; // Показываем максимум 11 кнопок
                                        }
                                        // Если активная страница близка к концу, сдвигаем диапазон вправо
                                        else if (currentPage >= totalPages - 5) {
                                            startPage = totalPages - totalButtons + 1;
                                            endPage = totalPages;
                                        }
                                    }

                                    // Генерация массива страниц
                                    const buttonsArray = Array.from(
                                        { length: endPage - startPage + 1 },
                                        (_, i) => startPage + i
                                    );

                                    return buttonsArray.map((page) => (
                                        <div
                                            className={page === currentPage ? "active" : ""}
                                            onClick={() => setCurrentPage(page)}
                                        >
                                            {page}
                                        </div>
                                    ));
                                })()}

                                {/* Правая стрелка */}
                                <svg
                                    onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                                    style={{
                                        cursor: currentPage < totalPages ? "pointer" : "default",
                                        opacity: currentPage < totalPages ? 1 : 0.5,
                                    }}
                                >
                                    <path d={arrowRightSvg}></path>
                                </svg>
                            </div>
                        </div>
                    </>
                }
            </div>
        </>
    )
}

function TopUps() {
    const [topups, setTopups] = useState([]);
    const [filteredTopups, setFilteredTopups] = useState([]);
    const [sortConfig, setSortConfig] = useState({field: 'datetime', direction: 'desc', name: 'Новые'})
    const [filterConfig, setFilterConfig] = useState({
        banks: [...Object.keys(banks)],
        tags: [],
        statuses: [...Object.keys(statuses)],
        currency: [],
        amount: {min: '', max: '', in_usd: false},
    })
    const [filterVisible, setFilterVisible] = useState({
        banks: false,
        statuses: false,
    })
    const [modal, setModal] = useState(null)

    function sortArrow(field) {
        if (field === sortConfig.field) {
            return sortConfig.direction === 'asc' ? ' ↓' : ' ↑';
        }
        return ''
    }


    useEffect(() => {
        async function getTopups() {
            const response = await axiinstance.get('/admin/topups/');
            if (response.data) {
                setTopups(response.data);
            }
        }

        getTopups()
    }, []);

    useEffect(() => {
        let filtered = [...topups]

        if (filterConfig.amount.min !== '' || filterConfig.amount.max !== '') {
            const min_value = filterConfig.amount.min === '' ? 0 : parseFloat(filterConfig.amount.min)
            const max_value = filterConfig.amount.max === '' ? Infinity : parseFloat(filterConfig.amount.max)

            filtered = filtered.filter((i) => {
                let value
                if (filterConfig.amount.in_usd) {
                    value = parseFloat(i.amount_in_usd)
                } else {
                    value = parseFloat(i.amount);
                }
                return value >= min_value && value <= max_value;
            })
        }

        filtered = filtered.filter((i) => {
            return filterConfig.statuses.some((ii) => ii === i.status)
        })

        const sorted = [...filtered].sort((a, b) => {
            const valueA = sortConfig.field === 'datetime' ? new Date(a[sortConfig.field]) : a[sortConfig.field];
            const valueB = sortConfig.field === 'datetime' ? new Date(b[sortConfig.field]) : b[sortConfig.field];

            if (valueA < valueB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (valueA > valueB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        })

        const formattedTopups = sorted.map((transaction) => ({
            ...transaction,
            datetime: new Date(transaction.datetime).toLocaleString('ru-RU', {
                hour12: false,
            }).replace(/,/g, ''),
            amount: parseFloat(transaction.amount.toFixed(2)),
            amount_in_usd: parseFloat(transaction.amount_in_usd.toFixed(2)),
        }));

        setFilteredTopups(formattedTopups);

    }, [topups, sortConfig, filterConfig]);

    return (
        <div className='topups'>
            {modal && (
                <div className='modal' onClick={(event) => {
                    if (event.target === event.currentTarget) {
                        setModal(null)
                    }
                }}>
                    {modal === 'sort' && (
                        <div className="modal-tab" onClick={(event) => {
                            if (event.target.className !== 'inactive' && event.target.tagName === 'BUTTON') {
                                setModal(null);
                            }}}>
                            <h3>Сортировать по:</h3>
                            <button
                                className={sortConfig.field === 'datetime' && sortConfig.direction === 'desc' ? 'inactive' : ''}
                                onClick={() => setSortConfig({field: 'datetime', direction: 'desc', name: 'Новые'})}
                            >Новые</button>
                            <button
                                className={sortConfig.field === 'datetime' && sortConfig.direction === 'asc' ? 'inactive' : ''}
                                onClick={() => setSortConfig({field: 'datetime', direction: 'asc', name: 'Старые'})}
                            >Старые</button>
                            <button
                                className={sortConfig.field === 'amount' && sortConfig.direction === 'desc' ? 'inactive' : ''}
                                onClick={() => setSortConfig({field: 'amount', direction: 'desc', name: 'Сумма больше'})}
                            >Сумма больше</button>
                            <button
                                className={sortConfig.field === 'amount' && sortConfig.direction === 'asc' ? 'inactive' : ''}
                                onClick={() => setSortConfig({field: 'amount', direction: 'asc', name: 'Сумма меньше'})}
                            >Сумма меньше</button>
                            <button
                                className={sortConfig.field === 'amount_in_usd' && sortConfig.direction === 'desc' ? 'inactive' : ''}
                                onClick={() => setSortConfig({field: 'amount_in_usd', direction: 'desc', name: 'Сумма $ больше'})}
                            >Сумма $ больше</button>
                            <button
                                className={sortConfig.field === 'amount_in_usd' && sortConfig.direction === 'asc' ? 'inactive' : ''}
                                onClick={() => setSortConfig({field: 'amount_in_usd', direction: 'asc', name: 'Сумма $ меньше'})}
                            >Сумма $ меньше</button>
                        </div>
                    )}
                    {modal === 'filter' && (
                        <div className='modal-tab filter'>
                            <div className='amount'>
                                <h3>Сумма</h3>
                                <div className='checkbox' onClick={() => {
                                    setFilterConfig({...filterConfig, amount: {...filterConfig.amount, in_usd: !filterConfig.amount.in_usd}})
                                }}>
                                    <input type="checkbox" checked={filterConfig.amount.in_usd}/>
                                    <p>в долларах</p>
                                </div>
                                От: <input type="text" className='input-text' value={filterConfig.amount.min} onChange={(event) => {
                                if (/^(\d*|\d+[,.]\d*)$/.test(event.target.value)) {
                                    const new_value = event.target.value.replace(/,/, '.')
                                    setFilterConfig({...filterConfig, amount: {...filterConfig.amount, min: new_value}})
                                }}}
                            /> до: <input type="text" className='input-text' value={filterConfig.amount.max} onChange={(event) => {
                                if (/^(\d*|\d+[,.]\d*)$/.test(event.target.value)) {
                                    const new_value = event.target.value.replace(/,/, '.')
                                    setFilterConfig({...filterConfig, amount: {...filterConfig.amount, max: new_value}})
                                }}}
                            />
                            </div>
                            <div className={`status${!filterVisible.statuses ? ' minimized' : ''}`}>
                                <h3
                                    onClick={() => setFilterVisible({
                                        ...filterVisible,
                                        statuses: !filterVisible.statuses
                                    })}
                                >Статус</h3>
                                {filterVisible.statuses &&
                                    <>
                                        {Object.keys(statuses).map(status => (
                                            <div className={`checkbox ${status}`} onClick={() => {
                                                if (filterConfig.statuses.some(i => i === status)) {
                                                    setFilterConfig({
                                                        ...filterConfig,
                                                        statuses: filterConfig.statuses.filter((i) => i !== status)
                                                    });
                                                } else {
                                                    setFilterConfig({
                                                        ...filterConfig,
                                                        statuses: [...filterConfig.statuses, status]
                                                    });
                                                }
                                            }}>
                                                <input type="checkbox"
                                                       checked={filterConfig.statuses.some((i) => i === status)}/>
                                                <p>{statuses[status]}</p>
                                            </div>
                                        ))}
                                    </>
                                }
                            </div>
                        </div>
                    )}
                </div>
            )}
            <div className='filter_and_sort'>
                <button className='sort' onClick={() => setModal('sort')}>
                    <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16' fill='currentColor'>
                        <path d='M 4.207,-2.798598e-8 0,4.207 1.414,5.621 3.207,3.828 v 10.586 h 2 V 3.828 L 7,5.621 8.414,4.207 Z M 11.207,14.828 7,10.621 8.414,9.207 10.207,11 V 0.41399997 h 2 V 11 L 14,9.207 l 1.414,1.414 z'/>
                    </svg>
                    &nbsp;{sortConfig.name}
                </button>
                <button className='filter' onClick={() => setModal('filter')}>
                    Фильтры
                </button>
            </div>
            <div className='table'>
                <table>
                    <thead>
                    <tr>
                        <th
                            onClick={() => {
                                if (sortConfig.field === 'datetime') {
                                    if (sortConfig.direction === 'asc') {
                                        setSortConfig({field: 'datetime', direction: 'desc', name: 'Новые'})
                                    } else {
                                        setSortConfig({field: 'datetime', direction: 'asc', name: 'Старые'})
                                    }
                                } else {
                                    setSortConfig({field: 'datetime', direction: 'desc', name: 'Новые'})
                                }
                            }}
                        >Дата{sortArrow('datetime')}</th>
                        <th>Пользователь</th>
                        <th>Метка</th>
                        <th>Статус</th>
                        <th
                            onClick={() => {
                                if (sortConfig.field === 'amount') {
                                    if (sortConfig.direction === 'asc') {
                                        setSortConfig({field: 'amount', direction: 'desc', name: 'Сумма больше'})
                                    } else {
                                        setSortConfig({field: 'amount', direction: 'asc', name: 'Сумма меньше'})
                                    }
                                } else {
                                    setSortConfig({field: 'amount', direction: 'desc', name: 'Сумма больше'})
                                }
                            }}
                        >Сумма{sortArrow('amount')}</th>
                        <th
                            onClick={() => {
                                if (sortConfig.field === 'amount_in_usd') {
                                    if (sortConfig.direction === 'asc') {
                                        setSortConfig({field: 'amount_in_usd', direction: 'desc', name: 'Сумма $ больше'})
                                    } else {
                                        setSortConfig({field: 'amount_in_usd', direction: 'asc', name: 'Сумма $ меньше'})
                                    }
                                } else {
                                    setSortConfig({field: 'amount_in_usd', direction: 'desc', name: 'Сумма $ больше'})
                                }
                            }}

                        >Сумма ${sortArrow('amount_in_usd')}</th>
                    </tr>
                    </thead>
                    <tbody>
                        {filteredTopups.length > 0 &&
                            filteredTopups.map((i) => (
                                <tr key={i.id}>
                                    <td>{i.datetime}</td>
                                    <td>{i.user}</td>
                                    <td>{i.tag}</td>
                                    <td className={i.status}><span>{statuses[i.status]}</span></td>
                                    <td>{i.amount}</td>
                                    <td>{i.amount_in_usd}</td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
        </div>
    )
}

function Users() {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);

    useEffect(() => {
        async function getUsers() {
            const response = await axiinstance.get('/admin/users/');
            if (response.data) {
                setUsers(response.data);
            }
        }
        getUsers()
    }, []);

    useEffect(() => {
        const formattedUsers = users.map((transaction) => ({
            ...transaction,
            datetime: new Date(transaction.datetime).toLocaleString('ru-RU', {
                hour12: false,
            }).replace(/,/g, ''),
        }));


        setFilteredUsers(formattedUsers);

    }, [users])

    return (
        <div className='users'>
            <div className='table'>
                <table>
                    <thead>
                    <tr>
                        <th>Дата регистрации</th>
                        <th>Имя</th>
                        <th>Username</th>
                        <th>Баланс</th>
                    </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length > 0 &&
                            filteredUsers.map((i) => (
                                <tr key={i.id}>
                                    <td>{i.datetime}</td>
                                    <td>{i.name}</td>
                                    <td>{i.username}</td>
                                    <td>{i.balance}</td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
        </div>
    )
}

function Currencies() {
    const [currencies, setCurrencies] = useState([]);
    const [filteredCurrencies, setFilteredCurrencies] = useState([]);
    const [modal, setModal] = useState(false);
    const [modalForm, setModalForm] = useState({
        name: '',
        code: '',
        symbol: '',
        percent: '',
        min_amount: '',
        commission_step: ''
    });
    const [zeroErrors, setZeroErrors] = useState(false);

    function changeModalValue(event) {
        let className = event.target.className;
        let value = event.target.value;

        if (className === 'percent') {
            value = value.replace(/,/, '.');
            if (/^([+\d-]*|[+\d-]+\.\d*)$/.test(value)) {
                setModalForm({ ...modalForm, [className]: value });
            }
        }
        else if (className === 'min_amount' || className === 'commission_step') {
            value = value.replace(/,/, '.');
            if (/^(\d*|\d+\.\d*)$/.test(value)) {
                setModalForm({ ...modalForm, [className]: value });
            }
        }
        else {
            setModalForm({ ...modalForm, [className]: value });
        }
         setZeroErrors(Object.values(modalForm).every(value => value !== ""))
    }

    async function createButton() {
        await setZeroErrors(Object.values(modalForm).every(value => value !== ""))
        if (zeroErrors) {
            await axiinstance.post('admin/create_currency/', modalForm)
            setModal(false)
        }
    }

    async function handleKeyDown(event) {
        if (event.key === 'Escape' && modal) {
            setModal(false)
        }
    }

    useEffect(() => {
        document.addEventListener("keydown", handleKeyDown);
        async function getCurrencies() {
            const response = await axiinstance.get('/admin/currencies/');
            if (response.data) {
                setCurrencies(response.data);
            }
        }
        getCurrencies()
    }, []);

    useEffect(() => {
        const formattedCurrencies = currencies.map((transaction) => ({
            ...transaction,
            datetime: new Date(transaction.datetime).toLocaleString('ru-RU', {
                hour12: false,
            }).replace(/,/g, ''),
        }));


        setFilteredCurrencies(formattedCurrencies);

    }, [currencies])

    return (
        <div className='currencies'>
            <div className='table'>
                <table>
                    <thead>
                    <tr>
                        <th>Название</th>
                        <th>Код</th>
                        <th>Символ</th>
                        <th>Курс</th>
                        <th>Процент</th>
                        <th>Минимальная сумма</th>
                        <th>Ступень комиссии</th>
                    </tr>
                    </thead>
                    <tbody>
                        {filteredCurrencies.length > 0 &&
                            filteredCurrencies.map((i) => (
                                <tr key={i.id}>
                                    <td>{i.name}</td>
                                    <td>{i.code}</td>
                                    <td>{i.symbol}</td>
                                    <td>{i.rate}</td>
                                    <td>{i.percent}</td>
                                    <td>{i.min_amount}</td>
                                    <td>{i.commission_step}</td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
            {modal ? (
                    <div className='modal' onClick={() => setModal(false)}>
                        <div
                            className='modal-tab'
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3>Новая валюта</h3>
                            <div className='input-group'>
                                <p>Название валюты</p>
                                <input
                                    type="text"
                                    className='name'
                                    value={modalForm.name}
                                    onChange={changeModalValue}
                                />
                            </div>
                            <div className='input-group'>
                                <p>Код валюты</p>
                                <input
                                    type="text"
                                    className='code'
                                    value={modalForm.code}
                                    onChange={changeModalValue}
                                />
                            </div>
                            <div className='input-group'>
                                <p>Символ</p>
                                <input
                                    type="text"
                                    className='symbol'
                                    value={modalForm.symbol}
                                    onChange={changeModalValue}
                                />
                            </div>
                            <div className='input-group'>
                                <p>Процент</p>
                                <input
                                    type="text"
                                    className='percent'
                                    value={modalForm.percent}
                                    onChange={changeModalValue}
                                />
                            </div>
                            <div className='input-group'>
                                <p>Минимальная сумма</p>
                                <input
                                    type="text"
                                    className='min_amount'
                                    value={modalForm.min_amount}
                                    onChange={changeModalValue}
                                />
                            </div>
                            <div className='input-group'>
                                <p>Ступень комиссии</p>
                                <input
                                    type="text"
                                    className='commission_step'
                                    value={modalForm.commission_step}
                                    onChange={changeModalValue}
                                />
                            </div>
                            <button
                                className={zeroErrors ? '' : 'inactive'}
                                onClick={createButton}
                            >
                                Создать
                            </button>
                        </div>
                    </div>
            ) : (
                <button className='create-currency' onClick={() => setModal(true)}>
                    Создать новую валюту
                </button>
            )}
        </div>
    )
}

export default function Admin() {
    const [auth, setAuth] = useState(null);
    const [activeLabel, setActiveLabel] = useState(null);

    const navigate = useNavigate()
    const location = useLocation();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                await axiinstance('admin/check_auth/')
                setAuth(true)
            } catch {
                setAuth(false)
            }
        }
        checkAuth()
    }, [])

    useEffect(() => {
        const currentPath = location.pathname.split('/').pop(); // Получаем последний сегмент URL
        if (['stats', 'withdraws', 'topups', 'users', 'currencies'].includes(currentPath)) {
            setActiveLabel(currentPath);
        }
    }, [location]);

    const changeLabel = (label) => {
        setActiveLabel(label);
        navigate(`/admin/${label}`);
    };

    return (
        <div className='admin'>
            {auth === false &&
                <Routes>
                    <Route path='auth' element={<Auth/>}/>
                    <Route path='*' element={<Navigate to='/admin/auth'/>}/>
                </Routes>
            }
            {auth === true &&
                <div className='container'>
                    <div className='labels'>
                        <button
                            className={`label stats ${activeLabel === 'stats' ? 'active' : ''}`}
                            onClick={() => {changeLabel('stats')}}
                        >Статистика</button>
                        <button
                            className={`label withdraws ${activeLabel === 'withdraws' ? 'active' : ''}`}
                            onClick={() => {changeLabel('withdraws')}}
                        >Выводы</button>
                        <button
                            className={`label topups ${activeLabel === 'topups' ? 'active' : ''}`}
                            onClick={() => {changeLabel('topups')}}
                        >Пополнения</button>
                        <button
                            className={`label users ${activeLabel === 'users' ? 'active' : ''}`}
                            onClick={() => {changeLabel('users')}}
                        >Пользователи</button>
                        <button
                            className={`label currencies ${activeLabel === 'currencies' ? 'active' : ''}`}
                            onClick={() => {changeLabel('currencies')}}
                        >Валюты</button>
                    </div>
                    <div className='tab'>
                        <Routes>
                            <Route path='stats' element={<Stats/>}/>
                            <Route path='withdraws' element={<Withdraws/>}/>
                            <Route path='topups' element={<TopUps/>}/>
                            <Route path='users' element={<Users/>}/>
                            <Route path='currencies' element={<Currencies/>}/>
                            <Route path='*' element={<Navigate to='/admin/stats'/>}/>
                        </Routes>
                    </div>
                </div>
            }
        </div>
    )
}