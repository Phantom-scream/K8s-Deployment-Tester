from selenium.webdriver.common.by import By

class K8sDeploymentTesterPage:
    URL = "http://localhost:3000"

    FILE_INPUT = (By.CSS_SELECTOR, "input[type='file']")
    CUSTOM_CMD_INPUT = (By.CSS_SELECTOR, "input[type='text']")
    START_BTN = (By.XPATH, "//button[contains(., 'Start Test')]")
    CLEANUP_BTN = (By.XPATH, "//button[contains(., 'Cleanup Resources')]")
    LOG_VIEWER = (By.CLASS_NAME, "log-viewer")
    POD_TRACKER = (By.XPATH, "//div[contains(., 'Pod tracker')]")

    def __init__(self, driver):
        self.driver = driver

    def load(self):
        self.driver.get(self.URL)

    def upload_yaml(self, yaml_path):
        self.driver.find_element(*self.FILE_INPUT).send_keys(yaml_path)

    def set_custom_command(self, cmd):
        input_elem = self.driver.find_element(*self.CUSTOM_CMD_INPUT)
        input_elem.clear()
        input_elem.send_keys(cmd)

    def click_start_test(self):
        self.driver.find_element(*self.START_BTN).click()

    def click_cleanup(self):
        self.driver.find_element(*self.CLEANUP_BTN).click()

    def get_logs(self):
        return self.driver.find_element(*self.LOG_VIEWER).text

    def pod_tracker_visible(self):
        try:
            return self.driver.find_element(*self.POD_TRACKER).is_displayed()
        except:
            return False

