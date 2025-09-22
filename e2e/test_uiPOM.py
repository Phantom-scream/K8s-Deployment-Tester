import time
from selenium import webdriver
from pages.k8s_deployment_tester_page import K8sDeploymentTesterPage

def test_deployment_flow():
    driver = webdriver.Chrome()
    page = K8sDeploymentTesterPage(driver)
    page.load()

    page.upload_yaml("test.yaml")

    time.sleep(2)
    page.click_start_test()

    time.sleep(5)
    logs = page.get_logs()
    assert "Parsing YAML" in logs

    page.click_cleanup()
    time.sleep(2)
    logs = page.get_logs()
    assert "Cleanup completed" in logs

    driver.quit()


