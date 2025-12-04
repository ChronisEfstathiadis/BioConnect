import { useState, useEffect } from "react";
import {
  getServices,
  createService,
  updateService,
  deleteService,
} from "../../../api/Services";
import type { Service } from "../../../types/ServicesTypes";
import { Modal } from "../../Modal/Modal";
import { ModalForm } from "./ModalForm";
import styles from "./Services.module.css";

export const Services = ({ profile_id }: { profile_id: string }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (profile_id) {
      const fetchServices = async () => {
        try {
          const services = await getServices(profile_id);
          setServices(services);
        } catch (error) {
          setError("Failed to fetch services");
          setServices([]);
        } finally {
          setIsLoading(false);
        }
      };
      fetchServices();
    }
  }, [profile_id]);

  const handleCreateService = async (service: Service) => {
    try {
      const newService = await createService(service);
      setServices([...services, newService]);
    } catch (error) {
      setError("Failed to create service");
    }
  };

  const handleUpdateService = async (service: Service) => {
    try {
      const updatedService = await updateService(service);
      setServices(
        services.map((s) => (s.id === service.id ? updatedService : s))
      );
    } catch (error) {
      setError("Failed to update service");
    }
  };

  const handleDeleteService = async (id: number) => {
    try {
      await deleteService(id);
      setServices(services.filter((s) => s.id !== id));
    } catch (error) {
      setError("Failed to delete service");
    }
  };

  const handleSubmit = async (formData: {
    title: string;
    description: string;
  }) => {
    try {
      await handleCreateService({
        title: formData.title,
        description: formData.description,
        profile_id: profile_id,
        sort_order: services.length,
      });
      setIsModalOpen(false);
    } catch (error) {
      setError(
        `Failed to create service: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  return (
    <div className={styles.servicesContainer}>
      {isLoading ? (
        <div className={styles.loading}>Loading...</div>
      ) : error ? (
        <div className={styles.error}>{error}</div>
      ) : (
        <div className={styles.servicesList}>
          <h2 className={styles.sectionTitle}>Services</h2>
          <button
            className={styles.addButton}
            onClick={() => setIsModalOpen(true)}>
            + Add Service
          </button>
          {services
            .filter((service) => service != null)
            .map((service: Service) => (
              <div key={String(service?.id)} className={styles.serviceItem}>
                <h3>{service?.title || "Untitled"}</h3>
                <p>{service?.description || ""}</p>
                <div className={styles.serviceActions}>
                  <button
                    className={styles.editButton}
                    onClick={() => handleUpdateService(service)}>
                    Edit
                  </button>
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDeleteService(service?.id || 0)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
        }}
        title="Add New Service"
        size="medium">
        <ModalForm onSubmit={handleSubmit} setIsModalOpen={setIsModalOpen} />
      </Modal>
    </div>
  );
};

export default Services;
