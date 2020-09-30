package fr.gouv.vitamui.cucumber.back.runners;

import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.runner.RunWith;

import fr.gouv.vitamui.AbstractIntegrationTest;
import io.cucumber.junit.CucumberOptions;
import net.serenitybdd.cucumber.CucumberWithSerenity;

@RunWith(CucumberWithSerenity.class)
//@formatter:off
@CucumberOptions(
        plugin = { "pretty" },
        features = "src/test/resources/features/back/referential",
        //        tags = "@Traces",
        glue = {
            "fr.gouv.vitamui.cucumber.back.steps.referential",
            "fr.gouv.vitamui.cucumber.back.steps.common",
            "fr.gouv.vitamui.cucumber.common"
        },
        monochrome = true
)
//@formatter:on
public class ReferentialIntegrationTest extends AbstractIntegrationTest {

    @BeforeClass
    public static void startServersAndSetData() {

    }

    @AfterClass
    public static void someStuff() {

    }

}
