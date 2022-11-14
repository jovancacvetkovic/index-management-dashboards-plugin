import React, { useContext, useEffect } from "react";
import { RouteComponentProps } from "react-router-dom";
import { BREADCRUMBS } from "../../../utils/constants";
import { CoreServicesContext } from "../../../components/core_services";
import { ContentPanel } from "../../../components/ContentPanel";
import {
  EuiButton,
  EuiFieldSearch,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiPanel,
  EuiRange,
  EuiSpacer,
  EuiTextArea,
} from "@elastic/eui";
import { useState } from "react";
import _ from "lodash";

interface FormsExampleProps extends RouteComponentProps {}

export const FormExamples: React.FC<FormsExampleProps> = (props) => {
  // const services = useContext(ServicesContext) as BrowserServices;
  const context = useContext(CoreServicesContext);

  const validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

  const [errors, setErrors] = useState<string[]>([]);
  const [value, setValue] = useState("");

  useEffect(() => {
    context?.chrome.setBreadcrumbs([BREADCRUMBS.FORM_EXAMPLES]);
  }, []);

  // @ts-ignore
  const onChange = (e) => {
    const value = e.target.value;
    setValue(value);

    if (_.isEmpty(value) || value.match(validRegex)) {
      setErrors([]);
    } else {
      setErrors(["Email is not valid"]);
    }
  };

  return (
    <ContentPanel bodyStyles={{ padding: "5px" }} title="Form Examples">
      <EuiPanel>
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiFieldSearch placeholder="Search..." fullWidth aria-label="An example of search with fullWidth" />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton>Search</EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>

        <EuiSpacer size="l" />

        <EuiFormRow label="Works on form rows too" fullWidth helpText="Note that the fullWidth prop is not passed to the form row's child">
          <EuiRange fullWidth min={0} max={100} name="range" value={10} />
        </EuiFormRow>

        <EuiFormRow label="Validate email" fullWidth isInvalid={!!errors.length} error={errors}>
          <EuiFieldText
            placeholder="Enter email"
            value={value}
            onChange={(e) => onChange(e)}
            aria-label="Use aria labels when no actual label is in use"
          />
        </EuiFormRow>

        <EuiFormRow label="Often useful for text areas" fullWidth>
          <EuiTextArea
            fullWidth
            placeholder="There is a reason we do not make forms ALWAYS 100% width.
          See how this text area becomes extremely hard to read when the individual
          lines get this long? It is much more readable when contained to a scannable max-width."
          />
        </EuiFormRow>
      </EuiPanel>
    </ContentPanel>
  );
};
