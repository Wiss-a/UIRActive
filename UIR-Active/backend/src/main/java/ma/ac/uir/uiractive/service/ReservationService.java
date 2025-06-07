package ma.ac.uir.uiractive.service;

import ma.ac.uir.uiractive.entity.Reservation;

import java.util.List;

public interface ReservationService {
    Reservation createReservation(Reservation reservation);
    Reservation updateReservationStatus(Long id, String status);
    List<Reservation> getAllReservations();
    List<Reservation> getReservationsByStatus(String status);
    Reservation getReservationById(Long id);
    void deleteReservation(Long id);
    long countAllReservations();
    long countReservationsByStatus(String status);
    List<Reservation> getReservationsByUserId(Long id);
}