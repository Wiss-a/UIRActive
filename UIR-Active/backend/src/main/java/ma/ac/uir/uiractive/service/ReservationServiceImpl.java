package ma.ac.uir.uiractive.service;

import jakarta.transaction.Transactional;
import ma.ac.uir.uiractive.dao.ReservationRepository;
import ma.ac.uir.uiractive.entity.Reservation;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReservationServiceImpl implements ReservationService {

    private final ReservationRepository reservationRepository;

    public ReservationServiceImpl(ReservationRepository reservationRepository) {
        this.reservationRepository = reservationRepository;
    }

    @Override
//    public Reservation createReservation(Reservation reservation) {
//        return reservationRepository.save(reservation);
//    }
    public Reservation createReservation(Reservation reservation) {
        try {
            return reservationRepository.save(reservation);
        } catch (Exception e) {
            System.err.println("Error in createReservation: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to create reservation", e);
        }
    }

    @Override
//    public Reservation updateReservationStatus(Long id, String status) {
//        Reservation reservation = reservationRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Reservation not found"));
//        reservation.setStatus(status);
//        return reservationRepository.save(reservation);
//    }
    public Reservation updateReservationStatus(Long id, String status) {
        try {
            Reservation reservation = getReservationById(id);
            reservation.setStatus(status);
            return reservationRepository.save(reservation);
        } catch (Exception e) {
            System.err.println("Error in updateReservationStatus: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to update reservation status", e);
        }
    }


    @Override
//    public List<Reservation> getAllReservations() {
//        return reservationRepository.findAll();
//    }
public List<Reservation> getAllReservations() {
    try {
        List<Reservation> reservations = reservationRepository.findAll();
        // Force initialization of lazy-loaded properties
        for (Reservation reservation : reservations) {
            if (reservation.getUser() != null) {
                reservation.getUser().getFirstname(); // Force load
            }
            if (reservation.getVenue() != null) {
                reservation.getVenue().getVenueName(); // Force load
            }
        }
        return reservations;
    } catch (Exception e) {
        System.err.println("Error in getAllReservations: " + e.getMessage());
        e.printStackTrace();
        throw new RuntimeException("Failed to fetch reservations", e);
    }
}



    @Override
//    public List<Reservation> getReservationsByStatus(String status) {
//        return reservationRepository.findByStatus(status);
//    }
    public List<Reservation> getReservationsByStatus(String status) {
        try {
            List<Reservation> reservations = reservationRepository.findByStatus(status);
            // Force initialization of lazy-loaded properties
            for (Reservation reservation : reservations) {
                if (reservation.getUser() != null) {
                    reservation.getUser().getFirstname(); // Force load
                }
                if (reservation.getVenue() != null) {
                    reservation.getVenue().getVenueName(); // Force load
                }
            }
            return reservations;
        } catch (Exception e) {
            System.err.println("Error in getReservationsByStatus: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to fetch reservations by status", e);
        }
    }

    @Override
//    public Reservation getReservationById(Long id) {
//        return reservationRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Reservation not found"));
//    }
    public Reservation getReservationById(Long id) {
        try {
            Reservation reservation = reservationRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Reservation not found with id: " + id));

            // Force initialization of lazy-loaded properties
            if (reservation.getUser() != null) {
                reservation.getUser().getFirstname(); // Force load
            }
            if (reservation.getVenue() != null) {
                reservation.getVenue().getVenueName(); // Force load
            }
            return reservation;
        } catch (Exception e) {
            System.err.println("Error in getReservationById: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to fetch reservation by id", e);
        }
    }


    @Override
    public void deleteReservation(Long id) {
        reservationRepository.deleteById(id);
    }

    @Override
    public long countAllReservations() {
        return reservationRepository.count();
    }

    @Override
    public long countReservationsByStatus(String status) {
        return reservationRepository.countByStatus(status);
    }

    @Override
    public List<Reservation> getReservationsByUserId(Long id) {
        return reservationRepository.findByUserIdU(id);
    }
}