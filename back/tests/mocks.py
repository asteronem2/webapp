import unittest
from unittest.mock import AsyncMock, patch
import httpx
from typing import Any

class APIClient:
    async def fetch_data(self, url: str, params: dict[str, Any]) -> dict:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params)
            return response.json()

class TestAPIClient(unittest.IsolatedAsyncioTestCase):  # Для асинхронных тестов в unittest
    async def test_fetch_data(self):
        # Указываем URL и параметры
        test_url = "https://example.com/api"
        test_params = {"param1": "value1"}

        # Ожидаемый результат
        mock_response_data = {"key": "value"}

        # Создаем экземпляр клиента
        client = APIClient()

        # Мокаем httpx.AsyncClient.get
        with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
            # Настраиваем поведение мока
            mock_get.return_value.json.return_value = mock_response_data

            # Вызываем тестируемую функцию
            result = await client.fetch_data(test_url, test_params)

            # Проверяем, что мок был вызван с правильными аргументами
            mock_get.assert_awaited_once_with(test_url, params=test_params)

            # Проверяем результат функции
            self.assertEqual(result, mock_response_data)
