from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
import time

driver = webdriver.Chrome()
driver.get("http://localhost:3000")

file_input = driver.find_element(By.CSS_SELECTOR, "input[type='file']")
file_input.send_keys("test.yaml")

time.sleep(2)
start_btn = driver.find_element(By.XPATH, "//button[contains(., 'Start Test')]")
start_btn.click()

time.sleep(5)
logs = driver.find_element(By.CLASS_NAME, "log-viewer").text
assert "Parsing YAML" in logs

cleanup_btn = driver.find_element(By.XPATH, "//button[contains(., 'Cleanup Resources')]")
cleanup_btn.click()

time.sleep(2)
logs = driver.find_element(By.CLASS_NAME, "log-viewer").text
assert "Cleanup completed" in logs
driver.quit()