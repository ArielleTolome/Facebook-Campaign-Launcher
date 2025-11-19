import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import '../styles/BulkEditModal.css';

const BulkEditSchema = Yup.object().shape({
  dailyBudget: Yup.number()
    .positive('Budget must be a positive number.')
    .typeError('Budget must be a number.'),
  lifetimeBudget: Yup.number()
    .positive('Budget must be a positive number.')
    .typeError('Budget must be a number.'),
});

const BulkEditModal = ({ isOpen, onClose, onSubmit, campaignCount }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Bulk Edit {campaignCount} Campaigns</h2>
        <p>Only fields you fill in will be updated across the selected campaigns.</p>

        <Formik
          initialValues={{
            dailyBudget: '',
            lifetimeBudget: '',
          }}
          validationSchema={BulkEditSchema}
          onSubmit={(values, { setSubmitting, resetForm }) => {
            // Filter out empty fields before submitting
            const updatedValues = Object.entries(values)
              .filter(([_, value]) => value !== '' && value !== null)
              .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

            if (Object.keys(updatedValues).length > 0) {
              onSubmit(updatedValues);
            }
            setSubmitting(false);
            resetForm();
            onClose();
          }}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form>
              <div className="form-group">
                <label htmlFor="dailyBudget">Daily Budget</label>
                <Field name="dailyBudget" type="number" placeholder="e.g., 50.00" />
                {errors.dailyBudget && touched.dailyBudget ? (
                  <div className="error-message">{errors.dailyBudget}</div>
                ) : null}
              </div>

              <div className="form-group">
                <label htmlFor="lifetimeBudget">Lifetime Budget</label>
                <Field name="lifetimeBudget" type="number" placeholder="e.g., 1000.00" />
                {errors.lifetimeBudget && touched.lifetimeBudget ? (
                  <div className="error-message">{errors.lifetimeBudget}</div>
                ) : null}
              </div>

              <div className="modal-actions">
                <button type="button" onClick={onClose} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="submit-btn">
                  Apply Changes
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default BulkEditModal;
